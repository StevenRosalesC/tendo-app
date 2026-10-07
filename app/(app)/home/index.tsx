import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { usePosSocket } from "../../../hooks/usePosSocket";
import tendoApi, { SaleRecord } from "../../../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useCurrentUser();
  const { isConnected: isWsConnected } = usePosSocket();

  const firstName = user?.name?.split(" ")[0] || "Operador";
  const storeName = user?.store?.name || "Sucursal Principal";

  // Compute today's start date (00:00:00)
  const todayStartIso = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return start.toISOString();
  }, []);

  // Fetch today's sales
  const {
    data: salesResponse,
    isLoading: isLoadingSales,
    isRefetching: isRefetchingSales,
    refetch: refetchSales,
  } = useQuery({
    queryKey: ["sales", "home-today", todayStartIso],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay token activo");
      return tendoApi.getSales(token, {
        limit: 20,
        startDate: todayStartIso,
      });
    },
    staleTime: 1000 * 30,
  });

  // Fetch total products in catalog
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", "home-count"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay token activo");
      return tendoApi.getProducts(token, { limit: 1 });
    },
    staleTime: 1000 * 60,
  });

  const salesToday: SaleRecord[] = useMemo(() => {
    return salesResponse?.data || [];
  }, [salesResponse]);

  // Compute metrics for today
  const todayMetrics = useMemo(() => {
    let totalSalesAmount = 0;
    let totalItemsCount = 0;

    for (const s of salesToday) {
      totalSalesAmount += s.total;
      if (Array.isArray(s.items)) {
        for (const item of s.items) {
          totalItemsCount += item.quantity;
        }
      }
    }

    const ticketCount = salesToday.length;
    const avgTicket = ticketCount > 0 ? totalSalesAmount / ticketCount : 0;

    return {
      totalSalesAmount,
      ticketCount,
      avgTicket,
      totalItemsCount,
    };
  }, [salesToday]);

  const totalCatalogProducts = productsResponse?.meta?.total ?? 0;

  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador", variant: "primary" as const };
      case "MANAGER":
        return { label: "Gerente", variant: "secondary" as const };
      case "CASHIER":
        return { label: "Cajero", variant: "info" as const };
      default:
        return { label: "Operador", variant: "neutral" as const };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  const handleRefresh = async () => {
    await Promise.all([refetchSales(), refetchProducts()]);
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full gap-5 pb-28"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetchingSales}
          onRefresh={handleRefresh}
          tintColor="#c0c1ff"
          colors={["#c0c1ff"]}
        />
      }
    >
      {/* 1. Welcome & Status Banner */}
      <View className="flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md">
        <View className="gap-1.5">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Hola, {firstName} 👋
            </Text>
            <Badge label={roleInfo.label} variant={roleInfo.variant} dot />
          </View>

          <View className="flex-row items-center gap-2 text-xs text-on-surface-variant flex-wrap">
            <MaterialIcons name="storefront" size={16} color="#c0c1ff" />
            <Text className="text-xs text-on-surface font-semibold">
              {storeName}
            </Text>
            <Text className="text-xs text-outline-variant">•</Text>
            <Text className="text-xs text-on-surface-variant">
              Turno activo
            </Text>
          </View>
        </View>

        {/* Live WebSocket Status & Refresh */}
        <View className="flex-row items-center gap-2.5">
          <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60">
            <View
              className={`w-2.5 h-2.5 rounded-full ${
                isWsConnected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <Text className="text-xs font-semibold text-on-surface">
              {isWsConnected ? "Socket en vivo" : "Sin conexión"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            activeOpacity={0.7}
            disabled={isLoadingSales || isRefetchingSales}
            className="h-9 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center gap-1.5"
          >
            {isRefetchingSales ? (
              <ActivityIndicator size="small" color="#c0c1ff" />
            ) : (
              <MaterialIcons name="refresh" size={17} color="#c0c1ff" />
            )}
            <Text className="text-xs font-semibold text-on-surface hidden sm:inline">
              Actualizar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Today's Real Metrics KPI Cards */}
      <View className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Ventas Hoy */}
        <Card variant="low" className="p-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Ventas de Hoy
            </Text>
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
              <MaterialIcons name="payments" size={18} color="#c0c1ff" />
            </View>
          </View>
          <Text className="text-2xl font-bold font-mono text-on-surface tracking-tight">
            {formatMoney(todayMetrics.totalSalesAmount)}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            {todayMetrics.ticketCount} tickets generados hoy
          </Text>
        </Card>

        {/* KPI 2: Tickets Hoy */}
        <Card variant="low" className="p-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Tickets Emitidos
            </Text>
            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="receipt-long" size={18} color="#22d3ee" />
            </View>
          </View>
          <Text className="text-2xl font-bold font-mono text-on-surface tracking-tight">
            {todayMetrics.ticketCount}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            Transacciones completadas
          </Text>
        </Card>

        {/* KPI 3: Ticket Promedio */}
        <Card variant="low" className="p-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Ticket Promedio
            </Text>
            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="trending-up" size={18} color="#34d399" />
            </View>
          </View>
          <Text className="text-2xl font-bold font-mono text-on-surface tracking-tight">
            {formatMoney(todayMetrics.avgTicket)}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            Promedio por cliente
          </Text>
        </Card>

        {/* KPI 4: Catálogo Activo */}
        <Card variant="low" className="p-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Productos en Tienda
            </Text>
            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="inventory-2" size={18} color="#c0c1ff" />
            </View>
          </View>
          <Text className="text-2xl font-bold font-mono text-on-surface tracking-tight">
            {isLoadingProducts ? "..." : totalCatalogProducts}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/inventory")}
            className="flex-row items-center gap-1"
          >
            <Text className="text-[11px] font-semibold text-primary">
              Ver catálogo
            </Text>
            <MaterialIcons name="chevron-right" size={14} color="#c0c1ff" />
          </TouchableOpacity>
        </Card>
      </View>

      {/* 3. Primary Action Heroes */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero: Iniciar Venta en POS */}
        <View className="lg:col-span-7 bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-lg flex-col justify-between">
          <View className="gap-3">
            <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 self-start">
              <MaterialIcons name="bolt" size={16} color="#c0c1ff" />
              <Text className="text-xs font-bold text-primary">
                Operación Principal
              </Text>
            </View>

            <View className="mt-1">
              <Text className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Terminal POS - Nueva Venta
              </Text>
              <Text className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                Apertura inmediata del carrito con interfaz táctil, escáner de código de barras, soporte de cantidades por peso/fracción y cobro en mostrador.
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center gap-4 py-2 mt-1">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="qr-code-scanner" size={18} color="#c0c1ff" />
                <Text className="text-xs font-medium text-on-surface">
                  Escaneo con cámara o USB
                </Text>
              </View>
              <View className="h-4 w-px bg-surface-container-highest" />
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="scale" size={18} color="#c0c1ff" />
                <Text className="text-xs font-medium text-on-surface">
                  Venta fraccionada por peso
                </Text>
              </View>
            </View>
          </View>

          <View className="pt-5">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/terminal")}
              className="w-full h-12 rounded-xl bg-primary flex-row items-center justify-center gap-2.5 shadow-lg shadow-primary/25"
            >
              <MaterialIcons
                name="point-of-sale"
                size={20}
                color="#1000a9"
              />
              <Text className="text-sm font-extrabold text-on-primary">
                Abrir Terminal POS
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#1000a9" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Cards: Accesos Rápidos a Inventario y Reportes */}
        <View className="lg:col-span-5 flex-col gap-4">
          {/* Card: Catálogo e Inventario */}
          <Card variant="low" className="p-5 justify-between gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                  <MaterialIcons name="inventory-2" size={18} color="#c0c1ff" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-on-surface">
                    Catálogo e Inventario
                  </Text>
                  <Text className="text-xs text-on-surface-variant">
                    {totalCatalogProducts} productos registrados
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/inventory")}
                className="p-2 rounded-lg bg-surface-container-high"
              >
                <MaterialIcons name="arrow-forward" size={16} color="#c0c1ff" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-on-surface-variant leading-relaxed">
              Alta de productos, existencias en tiempo real, precios de venta y costos de compra a proveedores.
            </Text>
          </Card>

          {/* Card: Reportes de Rentabilidad */}
          <Card variant="low" className="p-5 justify-between gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <MaterialIcons name="insights" size={18} color="#34d399" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-on-surface">
                    Reportes y Rentabilidad
                  </Text>
                  <Text className="text-xs text-on-surface-variant">
                    Cálculo de márgenes y COGS
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/reports")}
                className="p-2 rounded-lg bg-surface-container-high"
              >
                <MaterialIcons name="arrow-forward" size={16} color="#34d399" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-on-surface-variant leading-relaxed">
              Consulta utilidades brutas, márgenes reales y desglose ticket por ticket con costos congelados.
            </Text>
          </Card>
        </View>
      </View>

      {/* 4. Recent Real Transactions List */}
      <Card variant="low" className="gap-4">
        <View className="flex-row items-center justify-between pb-3 border-b border-surface-container-high/40">
          <View className="flex-row items-center gap-2.5">
            <MaterialIcons name="receipt-long" size={20} color="#c0c1ff" />
            <Text className="text-base font-bold text-on-surface">
              Ventas Recientes de Hoy ({salesToday.length})
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/reports")}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-semibold text-primary">
              Ver reporte completo
            </Text>
            <MaterialIcons name="chevron-right" size={16} color="#c0c1ff" />
          </TouchableOpacity>
        </View>

        {isLoadingSales && (
          <View className="py-10 items-center justify-center gap-2">
            <ActivityIndicator size="small" color="#c0c1ff" />
            <Text className="text-xs text-on-surface-variant">
              Cargando ventas de hoy...
            </Text>
          </View>
        )}

        {!isLoadingSales && salesToday.length === 0 && (
          <View className="py-10 items-center justify-center gap-2">
            <MaterialIcons name="shopping-bag" size={36} color="#77767e" />
            <Text className="text-sm font-semibold text-on-surface">
              Aún no hay ventas registradas hoy
            </Text>
            <Text className="text-xs text-on-surface-variant text-center max-w-sm">
              Las transacciones que proceses en la Terminal POS aparecerán aquí en tiempo real.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/terminal")}
              className="mt-2 px-4 py-2 rounded-xl bg-primary-container"
            >
              <Text className="text-xs font-bold text-on-primary-container">
                Cobrar primera venta
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoadingSales && salesToday.length > 0 && (
          <View className="gap-2.5">
            {salesToday.slice(0, 5).map((sale) => {
              const shortId = sale.id.substring(0, 8).toUpperCase();
              const itemCount =
                sale.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

              return (
                <View
                  key={sale.id}
                  className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high/40 flex-row items-center justify-between gap-3"
                >
                  <View className="gap-1 flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text className="text-xs font-mono font-bold text-primary">
                        #{shortId}
                      </Text>
                      <Text className="text-xs text-on-surface-variant">
                        • {formatTime(sale.createdAt)}
                      </Text>
                      <Badge
                        label={`${itemCount.toLocaleString("es-MX", { maximumFractionDigits: 2 })} arts`}
                        variant="neutral"
                        size="sm"
                      />
                    </View>

                    <Text className="text-[11px] text-on-surface-variant">
                      Cajero:{" "}
                      <Text className="font-semibold text-on-surface">
                        {sale.user?.name || "Operador"}
                      </Text>
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-base font-bold text-on-surface font-mono">
                      {formatMoney(sale.total)}
                    </Text>
                    <Text className="text-[10px] text-emerald-400 font-semibold">
                      Completada
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
