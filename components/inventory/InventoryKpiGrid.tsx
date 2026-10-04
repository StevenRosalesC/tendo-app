import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { InventoryKpiData } from "./types";

export interface InventoryKpiGridProps {
  data: InventoryKpiData;
  onReorderCritical?: () => void;
}

export default function InventoryKpiGrid({
  data,
  onReorderCritical,
}: InventoryKpiGridProps) {
  return (
    <View className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* KPI 1: Total Valuation */}
      <View className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm relative overflow-hidden">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Valoración Total Inventario
          </Text>
          <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
            <MaterialIcons
              name="account-balance-wallet"
              size={18}
              color="#c0c1ff"
            />
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
            ${data.valuation.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <View className="flex-row items-center">
              <MaterialIcons name="arrow-upward" size={14} color="#c3c0ff" />
              <Text className="text-xs font-semibold text-secondary ml-0.5">
                {data.valuation.trend}
              </Text>
            </View>
            <Text className="text-xs text-on-surface-variant">
              {data.valuation.trendLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* KPI 2: Critical / Low Stock */}
      <View className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm relative overflow-hidden">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Stock Bajo o Crítico
          </Text>
          <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
            <MaterialIcons name="warning" size={18} color="#ffb4ab" />
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              {data.criticalStock.count}
            </Text>
            <Text className="text-sm font-semibold text-error">
              {data.criticalStock.requiresPurchaseText}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-xs text-on-surface-variant">
              {data.criticalStock.depletedTodayText}
            </Text>
            <TouchableOpacity
              onPress={onReorderCritical}
              className="flex-row items-center gap-0.5"
            >
              <Text className="text-xs font-semibold text-secondary">
                Reordenar lote
              </Text>
              <MaterialIcons name="chevron-right" size={14} color="#c3c0ff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* KPI 3: Best Seller of Shift */}
      <View className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm relative overflow-hidden">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Más Vendido del Turno
          </Text>
          <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
            <MaterialIcons
              name="local-fire-department"
              size={18}
              color="#c3c0ff"
            />
          </View>
        </View>

        <View className="mt-4">
          <Text
            numberOfLines={1}
            className="text-base sm:text-lg font-bold text-on-surface truncate"
          >
            {data.bestSeller.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="px-2 py-0.5 rounded bg-surface-container-high">
              <Text className="text-xs font-semibold text-on-surface font-mono">
                {data.bestSeller.units} uds
              </Text>
            </View>
            <Text className="text-xs text-on-surface-variant">•</Text>
            <Text className="text-xs font-semibold text-on-surface">
              ${data.bestSeller.revenue.toFixed(2)} facturado
            </Text>
          </View>
        </View>
      </View>

      {/* KPI 4: Omnichannel Sync Status & Latency */}
      <View className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm relative overflow-hidden">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Integración Omnicanal
          </Text>
          <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
            <MaterialIcons name="hub" size={18} color="#c0c1ff" />
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              {data.sync.percentage}%
            </Text>
            <Text className="text-xs font-semibold text-secondary">
              Sincronizado
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-xs text-on-surface-variant truncate">
              Webhook activo ({data.sync.latencyMs}ms)
            </Text>
            <View className="px-1.5 py-0.5 rounded bg-surface-container-high">
              <Text className="text-[11px] font-medium text-on-surface">
                {data.sync.conflictCount} conflictos
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
