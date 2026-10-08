import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { InventoryKpiData } from "./types";

export interface InventoryKpiGridProps {
  data?: InventoryKpiData | null;
  isLoading?: boolean;
  isCriticalFilterActive?: boolean;
  onToggleCriticalFilter?: () => void;
}

export default function InventoryKpiGrid({
  data,
  isLoading = false,
  isCriticalFilterActive = false,
  onToggleCriticalFilter,
}: InventoryKpiGridProps) {
  const retailTotal = data?.totalInventoryRetail ?? 0;
  const costTotal = data?.totalInventoryCost ?? 0;
  const profitTotal = data?.potentialProfit ?? 0;
  const totalUnits = data?.totalUnitsInStock ?? 0;
  const totalProducts = data?.totalProducts ?? 0;
  const criticalCount = data?.criticalStockCount ?? 0;
  const outOfStockCount = data?.outOfStockCount ?? 0;
  const totalAlerts = criticalCount + outOfStockCount;

  const estimatedMargin =
    retailTotal > 0
      ? Math.round((profitTotal / retailTotal) * 100)
      : costTotal === 0 && retailTotal > 0
      ? 100
      : 0;

  // 1. Total Retail Valuation Card
  const cardValuation = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Valoración Retail
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons
            name="account-balance-wallet"
            size={16}
            color="#c0c1ff"
          />
        </View>
      </View>

      <View className="mt-2.5">
        {isLoading ? (
          <ActivityIndicator size="small" color="#c0c1ff" />
        ) : (
          <>
            <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              ${retailTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text
                numberOfLines={1}
                className="text-[11px] sm:text-xs text-on-surface-variant truncate"
              >
                Costo inversión: ${costTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  // 2. Projected Profit Card
  const cardProfit = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Utilidad Proyectada
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons name="trending-up" size={16} color="#4ade80" />
        </View>
      </View>

      <View className="mt-2.5">
        {isLoading ? (
          <ActivityIndicator size="small" color="#4ade80" />
        ) : (
          <>
            <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              +${profitTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                <Text className="text-[10px] sm:text-xs font-semibold text-secondary">
                  {estimatedMargin}% margen
                </Text>
              </View>
              <Text className="text-[11px] sm:text-xs text-on-surface-variant">
                rendimiento catálogo
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  // 3. Critical & Low Stock Card (Interactive Filter)
  const cardCritical = (
    <TouchableOpacity
      activeOpacity={onToggleCriticalFilter ? 0.75 : 1}
      onPress={onToggleCriticalFilter}
      className={`p-3.5 sm:p-4 rounded-2xl border flex-col justify-between flex-1 min-h-[110px] ${
        isCriticalFilterActive
          ? "bg-error-container/30 border-error"
          : "bg-surface-container border-surface-container-high/60"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Stock Crítico / Alertas
        </Text>
        <View
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg items-center justify-center ${
            totalAlerts > 0 ? "bg-error-container" : "bg-surface-container-high"
          }`}
        >
          <MaterialIcons
            name="warning"
            size={16}
            color={totalAlerts > 0 ? "#ffb4ab" : "#938f99"}
          />
        </View>
      </View>

      <View className="mt-2.5">
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffb4ab" />
        ) : (
          <>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
                {totalAlerts}
              </Text>
              <Text
                className={`text-xs sm:text-sm font-semibold ${
                  totalAlerts > 0 ? "text-error" : "text-on-surface-variant"
                }`}
              >
                {totalAlerts === 0 ? "Nivel óptimo" : "artículos"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-[11px] sm:text-xs text-on-surface-variant">
                {outOfStockCount} agotados • {criticalCount} bajos
              </Text>
              {onToggleCriticalFilter && (
                <View className="flex-row items-center gap-0.5">
                  <Text
                    className={`text-[11px] sm:text-xs font-semibold ${
                      isCriticalFilterActive ? "text-error" : "text-secondary"
                    }`}
                  >
                    {isCriticalFilterActive ? "Quitar filtro" : "Filtrar"}
                  </Text>
                  <MaterialIcons
                    name={isCriticalFilterActive ? "close" : "chevron-right"}
                    size={13}
                    color={isCriticalFilterActive ? "#ffb4ab" : "#c3c0ff"}
                  />
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  // 4. Total Stock Units & Products Count Card
  const cardUnits = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Unidades en Almacén
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons name="inventory-2" size={16} color="#c0c1ff" />
        </View>
      </View>

      <View className="mt-2.5">
        {isLoading ? (
          <ActivityIndicator size="small" color="#c0c1ff" />
        ) : (
          <>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
                {totalUnits.toLocaleString("en-US")}
              </Text>
              <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant">
                uds
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-0.5">
              <Text className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                En {totalProducts} {totalProducts === 1 ? "artículo" : "artículos"} registrados
              </Text>
              <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                <Text className="text-[10px] sm:text-[11px] font-medium text-secondary">
                  En línea
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View className="w-full">
      {/* 1. Mobile View: Horizontal swipeable cards (conserves vertical space) */}
      <View className="flex sm:hidden w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 py-0.5 px-0.5"
        >
          <View className="w-[260px]">{cardValuation}</View>
          <View className="w-[260px]">{cardProfit}</View>
          <View className="w-[260px]">{cardCritical}</View>
          <View className="w-[260px]">{cardUnits}</View>
        </ScrollView>
      </View>

      {/* 2. Tablet & Desktop View: 4-Column Grid */}
      <View className="hidden sm:flex flex-row flex-wrap -m-2">
        <View className="w-1/2 xl:w-1/4 p-2">{cardValuation}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{cardProfit}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{cardCritical}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{cardUnits}</View>
      </View>
    </View>
  );
}
