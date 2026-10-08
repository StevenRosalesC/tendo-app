import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import tendoApi, { SaleRecord, SaleItemRecord } from "../../../services/api";
import useAuthStore from "../../../stores/useAuthStore";
import usePermissions from "../../../hooks/usePermissions";
import { AppAction, AppResource } from "../../../types/permissions.types";

type PeriodFilter = "today" | "7days" | "30days" | "all";

interface PeriodOption {
  key: PeriodFilter;
  label: string;
}

const PERIODS: PeriodOption[] = [
  { key: "today", label: "Hoy" },
  { key: "7days", label: "Últimos 7 días" },
  { key: "30days", label: "Este mes" },
  { key: "all", label: "Histórico total" },
];

export default function ReportsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { can, role } = usePermissions();
  const canReadReports = can(AppResource.REPORTS, AppAction.READ);
  const isManagerOrAdmin = useAuthStore((s) => s.isManager());

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("today");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  // Compute date range based on selected period
  const dateRange = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return { startDate: start.toISOString() };
    }
    if (selectedPeriod === "7days") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString() };
    }
    if (selectedPeriod === "30days") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { startDate: start.toISOString() };
    }
    return {};
  }, [selectedPeriod]);

  // Query sales data
  const {
    data: salesResponse,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["sales", selectedPeriod, dateRange.startDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay token de autenticación disponible");
      return tendoApi.getSales(token, {
        limit: 100,
        startDate: dateRange.startDate,
      });
    },
    enabled: canReadReports,
    staleTime: 1000 * 30, // 30 seconds
  });

  const sales: SaleRecord[] = useMemo(() => {
    return salesResponse?.data || [];
  }, [salesResponse]);

  // Filter sales by search query (ticket id, cashier name, product name)
  const filteredSales = useMemo(() => {
    if (!searchFilter.trim()) return sales;
    const q = searchFilter.toLowerCase().trim();
    return sales.filter((sale) => {
      const matchId = sale.id.toLowerCase().includes(q);
      const matchUser = sale.user?.name?.toLowerCase().includes(q);
      const matchProduct = sale.items?.some((i) =>
        i.product?.name?.toLowerCase().includes(q)
      );
      return matchId || matchUser || matchProduct;
    });
  }, [sales, searchFilter]);

  // Compute key profitability and sales metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalItems = 0;

    for (const sale of sales) {
      totalRevenue += sale.total;
      if (Array.isArray(sale.items)) {
        for (const item of sale.items) {
          totalItems += item.quantity;
          const cost = (item.costPriceAtSale ?? 0) * item.quantity;
          totalCogs += cost;
        }
      }
    }

    const grossProfit = totalRevenue - totalCogs;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const averageTicket =
      sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      profitMargin,
      totalSalesCount: sales.length,
      averageTicket,
      totalItems,
    };
  }, [sales]);

  // Format currency helpers
  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for individual sale metrics
  const getSaleMetrics = (sale: SaleRecord) => {
    let saleCogs = 0;
    let totalItems = 0;

    if (Array.isArray(sale.items)) {
      for (const item of sale.items) {
        totalItems += item.quantity;
        saleCogs += (item.costPriceAtSale ?? 0) * item.quantity;
      }
    }

    const saleProfit = sale.total - saleCogs;
    const saleMargin =
      sale.total > 0 ? (saleProfit / sale.total) * 100 : 0;

    return { saleCogs, saleProfit, saleMargin, totalItems };
  };

  if (!canReadReports) {
    return (
      <View className="flex-1 bg-surface items-center justify-center p-6">
        <View className="max-w-md w-full bg-surface-container-low border border-surface-container-high rounded-3xl p-8 items-center gap-4">
          <View className="w-16 h-16 rounded-2xl bg-amber-500/10 items-center justify-center">
            <MaterialIcons name="lock" size={32} color="#FBBF24" />
          </View>
          <Text className="text-xl font-bold text-on-surface text-center">
            Acceso Restringido
          </Text>
          <Text className="text-xs text-on-surface-variant text-center leading-relaxed">
            Tu rol actual ({role || "Cajero"}) no tiene permisos para consultar reportes y métricas de la tienda. Consulta con un administrador si requieres acceso.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/home")}
            activeOpacity={0.7}
            className="mt-2 bg-primary px-6 py-3 rounded-xl flex-row items-center gap-2"
          >
            <MaterialIcons name="arrow-back" size={18} color="#0d0096" />
            <Text className="text-xs font-bold text-on-primary">
              Volver al Inicio Hub
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full gap-6 pb-28"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor="#c0c1ff"
          colors={["#c0c1ff"]}
        />
      }
    >
      {/* 1. Header Section */}
      <View className="flex-row items-center justify-between flex-wrap gap-4 pb-2 border-b border-surface-container-high/40">
        <View className="gap-1">
          <View className="flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center">
              <MaterialIcons name="insights" size={22} color="#c0c1ff" />
            </View>
            <View>
              <Text className="text-xl sm:text-2xl font-bold text-on-surface">
                Reportes y Rentabilidad
              </Text>
              <Text className="text-xs sm:text-sm text-on-surface-variant">
                Análisis financiero, costo histórico de mercancía y márgenes brutos
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.7}
          disabled={isLoading || isRefetching}
          className="flex-row items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest"
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color="#c0c1ff" />
          ) : (
            <MaterialIcons name="refresh" size={18} color="#c0c1ff" />
          )}
          <Text className="text-xs font-semibold text-on-surface">
            Actualizar datos
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Period Filter Selector */}
      <View className="flex-row items-center gap-2 flex-wrap">
        {PERIODS.map((p) => {
          const isSelected = selectedPeriod === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.8}
              onPress={() => setSelectedPeriod(p.key)}
              className={`px-3.5 py-2 rounded-xl border ${
                isSelected
                  ? "bg-primary-container border-primary"
                  : "bg-surface-container-high/60 border-surface-container-high"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected
                    ? "text-on-primary-container font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Primary KPI Cards Grid */}
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos Totales */}
        <Card variant="low" className="p-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-on-surface-variant">
              Ventas Totales
            </Text>
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="payments" size={18} color="#c0c1ff" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-on-surface">
            {formatMoney(metrics.totalRevenue)}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            {metrics.totalSalesCount} transacciones en el periodo
          </Text>
        </Card>

        {/* KPI 2: Costo de Adquisición (COGS) - Manager only */}
        {isManagerOrAdmin ? (
          <Card variant="low" className="p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-on-surface-variant">
                Costo Total (COGS)
              </Text>
              <View className="w-8 h-8 rounded-lg bg-amber-500/10 items-center justify-center">
                <MaterialIcons name="local-shipping" size={18} color="#FBBF24" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-amber-400">
              {formatMoney(metrics.totalCogs)}
            </Text>
            <Text className="text-[11px] text-on-surface-variant">
              Costo de compra histórico congelado
            </Text>
          </Card>
        ) : (
          <Card variant="low" className="p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-on-surface-variant">
                Ticket Promedio
              </Text>
              <View className="w-8 h-8 rounded-lg bg-cyan-500/10 items-center justify-center">
                <MaterialIcons name="receipt-long" size={18} color="#22D3EE" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-cyan-400">
              {formatMoney(metrics.averageTicket)}
            </Text>
            <Text className="text-[11px] text-on-surface-variant">
              Promedio por cliente atendido
            </Text>
          </Card>
        )}

        {/* KPI 3: Ganancia Bruta - Manager only */}
        {isManagerOrAdmin ? (
          <Card variant="low" className="p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-on-surface-variant">
                Ganancia Bruta
              </Text>
              <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center">
                <MaterialIcons name="trending-up" size={18} color="#34D399" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-emerald-400">
              {formatMoney(metrics.grossProfit)}
            </Text>
            <Text className="text-[11px] text-emerald-400/80">
              Ventas menos costos de mercancía
            </Text>
          </Card>
        ) : (
          <Card variant="low" className="p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-on-surface-variant">
                Artículos Vendidos
              </Text>
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <MaterialIcons name="inventory-2" size={18} color="#c0c1ff" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-on-surface">
              {metrics.totalItems.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
            </Text>
            <Text className="text-[11px] text-on-surface-variant">
              Unidades y peso despachado
            </Text>
          </Card>
        )}

        {/* KPI 4: Margen de Ganancia - Manager only */}
        {isManagerOrAdmin ? (
          <Card variant="low" className="p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-medium text-on-surface-variant">
                Margen Real
              </Text>
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <MaterialIcons name="pie-chart" size={18} color="#c0c1ff" />
              </View>
            </View>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-bold text-primary">
                {metrics.profitMargin.toFixed(1)}%
              </Text>
              <Badge
                label={
                  metrics.profitMargin >= 30
                    ? "Excelente"
                    : metrics.profitMargin >= 15
                    ? "Saludable"
                    : "Bajo margen"
                }
                variant={
                  metrics.profitMargin >= 30
                    ? "success"
                    : metrics.profitMargin >= 15
                    ? "primary"
                    : "warning"
                }
                size="sm"
              />
            </View>
            <Text className="text-[11px] text-on-surface-variant">
              Margen bruto sobre ventas totales
            </Text>
          </Card>
        ) : (
          <Card variant="low" className="p-4 gap-2 justify-center bg-surface-container-high/40">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="lock" size={16} color="#c7c4d7" />
              <Text className="text-xs font-semibold text-on-surface">
                Métricas Financieras
              </Text>
            </View>
            <Text className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Costos de adquisición y márgenes reservados para gerencia.
            </Text>
          </Card>
        )}
      </View>

      {/* Secondary Quick Metrics Bar for Manager */}
      {isManagerOrAdmin && (
        <Card variant="default" className="flex-row items-center justify-between flex-wrap gap-4 p-4">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-lg bg-primary-container/20 items-center justify-center">
              <MaterialIcons name="point-of-sale" size={20} color="#c0c1ff" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-medium">
                Ticket Promedio
              </Text>
              <Text className="text-base font-bold text-on-surface">
                {formatMoney(metrics.averageTicket)}
              </Text>
            </View>
          </View>

          <View className="h-8 w-px bg-surface-container-highest hidden sm:flex" />

          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-lg bg-primary-container/20 items-center justify-center">
              <MaterialIcons name="inventory-2" size={20} color="#c0c1ff" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-medium">
                Artículos Despachados
              </Text>
              <Text className="text-base font-bold text-on-surface">
                {metrics.totalItems.toLocaleString("es-MX", { maximumFractionDigits: 2 })} unidades/peso
              </Text>
            </View>
          </View>

          <View className="h-8 w-px bg-surface-container-highest hidden sm:flex" />

          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-lg bg-emerald-500/10 items-center justify-center">
              <MaterialIcons name="verified" size={20} color="#34D399" />
            </View>
            <View>
              <Text className="text-xs text-on-surface-variant font-medium">
                Precisión de Costeo
              </Text>
              <Text className="text-xs font-semibold text-emerald-400">
                100% Congelado en Transacción
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* 4. Sales History & Breakdown List */}
      <Card variant="low" className="gap-4">
        <View className="flex-row items-center justify-between flex-wrap gap-3 pb-3 border-b border-surface-container-high/40">
          <View className="flex-row items-center gap-2.5">
            <MaterialIcons name="receipt-long" size={20} color="#c0c1ff" />
            <Text className="text-base font-bold text-on-surface">
              Transacciones Registradas ({filteredSales.length})
            </Text>
          </View>

          {/* Search Input Filter */}
          <View className="flex-row items-center bg-surface-container-highest rounded-xl px-3 h-10 w-full sm:w-64 border border-surface-container-high">
            <MaterialIcons name="search" size={18} color="#77767e" />
            <TextInput
              placeholder="Buscar por ticket, cajero..."
              placeholderTextColor="#77767e"
              value={searchFilter}
              onChangeText={setSearchFilter}
              className="flex-1 text-xs text-on-surface ml-2"
            />
            {searchFilter.length > 0 && (
              <TouchableOpacity onPress={() => setSearchFilter("")}>
                <MaterialIcons name="close" size={16} color="#77767e" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View className="py-12 items-center justify-center gap-3">
            <ActivityIndicator size="large" color="#c0c1ff" />
            <Text className="text-xs text-on-surface-variant">
              Cargando historial de ventas...
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!isLoading && filteredSales.length === 0 && (
          <View className="py-12 items-center justify-center gap-2">
            <MaterialIcons name="shopping-bag" size={40} color="#77767e" />
            <Text className="text-sm font-semibold text-on-surface">
              No se encontraron ventas
            </Text>
            <Text className="text-xs text-on-surface-variant text-center max-w-sm">
              {searchFilter
                ? "No hay resultados para tu criterio de búsqueda."
                : "No hay transacciones registradas en el periodo seleccionado."}
            </Text>
          </View>
        )}

        {/* Sales List */}
        {!isLoading && filteredSales.length > 0 && (
          <View className="gap-2.5">
            {filteredSales.map((sale) => {
              const { saleCogs, saleProfit, saleMargin, totalItems } =
                getSaleMetrics(sale);
              const shortId = sale.id.substring(0, 8).toUpperCase();

              return (
                <TouchableOpacity
                  key={sale.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSale(sale)}
                  className="p-3.5 sm:p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/40 flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left Column: Ticket ID, Date, Cashier */}
                  <View className="gap-1 flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className="text-xs font-mono font-bold text-primary">
                        #{shortId}
                      </Text>
                      <Text className="text-xs text-on-surface-variant">
                        • {formatDate(sale.createdAt)}
                      </Text>
                      <Badge
                        label={`${totalItems.toLocaleString("es-MX", { maximumFractionDigits: 2 })} ítems`}
                        variant="neutral"
                        size="sm"
                      />
                    </View>

                    <View className="flex-row items-center gap-2 mt-0.5">
                      <MaterialIcons name="person" size={14} color="#77767e" />
                      <Text className="text-xs text-on-surface-variant">
                        Cajero:{" "}
                        <Text className="font-semibold text-on-surface">
                          {sale.user?.name || "Operador"}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Right Column: Financial Breakdown & Total */}
                  <View className="flex-row items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-container-high/40">
                    {/* Cost & Profit (Manager Only) */}
                    {isManagerOrAdmin && (
                      <View className="items-end gap-0.5">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-[11px] text-on-surface-variant">
                            Costo: {formatMoney(saleCogs)}
                          </Text>
                          <Text className="text-[11px] font-semibold text-emerald-400">
                            (+{formatMoney(saleProfit)})
                          </Text>
                        </View>
                        <Badge
                          label={`${saleMargin.toFixed(0)}% margen`}
                          variant={
                            saleMargin >= 30
                              ? "success"
                              : saleMargin >= 15
                              ? "primary"
                              : "warning"
                          }
                          size="sm"
                        />
                      </View>
                    )}

                    {/* Sale Total Amount */}
                    <View className="items-end">
                      <Text className="text-base sm:text-lg font-bold text-on-surface">
                        {formatMoney(sale.total)}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-[10px] text-primary font-medium">
                          Ver detalle
                        </Text>
                        <MaterialIcons
                          name="chevron-right"
                          size={14}
                          color="#c0c1ff"
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>

      {/* 5. Detailed Sale Modal */}
      {selectedSale && (
        <Modal
          visible={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          title={`Detalle de Venta #${selectedSale.id.substring(0, 8).toUpperCase()}`}
          subtitle={`${formatDate(selectedSale.createdAt)} • Atendido por ${selectedSale.user?.name || "Operador"}`}
          icon="receipt"
          maxWidth="lg"
        >
          <View className="gap-5">
            {/* Items Table */}
            <View className="rounded-xl border border-surface-container-high overflow-hidden">
              <View className="flex-row items-center bg-surface-container-high/80 px-3 py-2 border-b border-surface-container-high">
                <Text className="flex-1 text-[11px] font-bold text-on-surface-variant uppercase">
                  Producto
                </Text>
                <Text className="w-16 text-center text-[11px] font-bold text-on-surface-variant uppercase">
                  Cant.
                </Text>
                <Text className="w-20 text-right text-[11px] font-bold text-on-surface-variant uppercase">
                  Precio
                </Text>
                {isManagerOrAdmin && (
                  <Text className="w-20 text-right text-[11px] font-bold text-on-surface-variant uppercase">
                    Costo
                  </Text>
                )}
                <Text className="w-24 text-right text-[11px] font-bold text-on-surface-variant uppercase">
                  Subtotal
                </Text>
              </View>

              <View className="divide-y divide-surface-container-high/40 bg-surface-container/30">
                {selectedSale.items?.map((item, idx) => {
                  const itemSubtotal = item.priceAtSale * item.quantity;
                  const itemCostTotal = (item.costPriceAtSale ?? 0) * item.quantity;
                  const itemProfit = itemSubtotal - itemCostTotal;

                  return (
                    <View
                      key={item.id || idx}
                      className="flex-row items-center px-3 py-2.5"
                    >
                      <View className="flex-1 gap-0.5">
                        <Text className="text-xs font-semibold text-on-surface">
                          {item.product?.name || "Producto sin nombre"}
                        </Text>
                        {item.product?.barcode && (
                          <Text className="text-[10px] font-mono text-on-surface-variant">
                            {item.product.barcode}
                          </Text>
                        )}
                      </View>

                      <Text className="w-16 text-center text-xs font-medium text-on-surface">
                        {item.quantity.toLocaleString("es-MX", {
                          maximumFractionDigits: 2,
                        })}
                      </Text>

                      <Text className="w-20 text-right text-xs text-on-surface-variant">
                        {formatMoney(item.priceAtSale)}
                      </Text>

                      {isManagerOrAdmin && (
                        <Text className="w-20 text-right text-xs text-amber-400/90">
                          {formatMoney(item.costPriceAtSale ?? 0)}
                        </Text>
                      )}

                      <View className="w-24 items-end">
                        <Text className="text-xs font-bold text-on-surface">
                          {formatMoney(itemSubtotal)}
                        </Text>
                        {isManagerOrAdmin && (
                          <Text className="text-[10px] font-medium text-emerald-400">
                            +{formatMoney(itemProfit)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Ticket Totals Summary Card */}
            {(() => {
              const { saleCogs, saleProfit, saleMargin } =
                getSaleMetrics(selectedSale);
              return (
                <View className="p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high gap-2.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-on-surface-variant">
                      Total Cobrado al Cliente
                    </Text>
                    <Text className="text-lg font-bold text-on-surface">
                      {formatMoney(selectedSale.total)}
                    </Text>
                  </View>

                  {isManagerOrAdmin && (
                    <>
                      <View className="h-px bg-surface-container-highest my-0.5" />

                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-on-surface-variant">
                          Costo Histórico de Adquisición (COGS)
                        </Text>
                        <Text className="text-xs font-semibold text-amber-400">
                          {formatMoney(saleCogs)}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-on-surface-variant">
                          Ganancia Bruta Neta
                        </Text>
                        <Text className="text-sm font-bold text-emerald-400">
                          +{formatMoney(saleProfit)}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-on-surface-variant">
                          Margen de Ganancia Real
                        </Text>
                        <Badge
                          label={`${saleMargin.toFixed(1)}%`}
                          variant={
                            saleMargin >= 30
                              ? "success"
                              : saleMargin >= 15
                              ? "primary"
                              : "warning"
                          }
                          size="sm"
                        />
                      </View>
                    </>
                  )}
                </View>
              );
            })()}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSelectedSale(null)}
              activeOpacity={0.8}
              className="py-3 rounded-xl bg-surface-container-highest items-center justify-center border border-surface-container-high"
            >
              <Text className="text-xs font-bold text-on-surface">
                Cerrar detalle
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}
