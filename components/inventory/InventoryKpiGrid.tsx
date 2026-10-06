import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { InventoryKpiData } from "./types";

export interface InventoryKpiGridProps {
  data: InventoryKpiData;
  onReorderCritical?: () => void;
}

export default function InventoryKpiGrid({
  data,
  onReorderCritical,
}: InventoryKpiGridProps) {
  // Common cards content
  const card1 = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Valoración Total
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
        <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
          ${data.valuation.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View className="flex-row items-center">
            <MaterialIcons name="arrow-upward" size={13} color="#c3c0ff" />
            <Text className="text-[11px] sm:text-xs font-semibold text-secondary ml-0.5">
              {data.valuation.trend}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            className="text-[11px] sm:text-xs text-on-surface-variant truncate"
          >
            {data.valuation.trendLabel}
          </Text>
        </View>
      </View>
    </View>
  );

  const card2 = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Stock Bajo o Crítico
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons name="warning" size={16} color="#ffb4ab" />
        </View>
      </View>

      <View className="mt-2.5">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
            {data.criticalStock.count}
          </Text>
          <Text className="text-xs sm:text-sm font-semibold text-error">
            {data.criticalStock.requiresPurchaseText}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-[11px] sm:text-xs text-on-surface-variant">
            {data.criticalStock.depletedTodayText}
          </Text>
          {onReorderCritical && (
            <TouchableOpacity
              onPress={onReorderCritical}
              className="flex-row items-center gap-0.5"
            >
              <Text className="text-[11px] sm:text-xs font-semibold text-secondary">
                Reordenar
              </Text>
              <MaterialIcons name="chevron-right" size={13} color="#c3c0ff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const card3 = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Más Vendido del Turno
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons
            name="local-fire-department"
            size={16}
            color="#c3c0ff"
          />
        </View>
      </View>

      <View className="mt-2.5">
        <Text
          numberOfLines={1}
          className="text-sm sm:text-base lg:text-lg font-bold text-on-surface truncate"
        >
          {data.bestSeller.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
            <Text className="text-[10px] sm:text-xs font-semibold text-on-surface font-mono">
              {data.bestSeller.units} uds
            </Text>
          </View>
          <Text className="text-xs text-on-surface-variant">•</Text>
          <Text className="text-[11px] sm:text-xs font-semibold text-on-surface">
            ${data.bestSeller.revenue.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const card4 = (
    <View className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-col justify-between shadow-sm flex-1 min-h-[110px]">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Integración Omnicanal
        </Text>
        <View className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons name="hub" size={16} color="#c0c1ff" />
        </View>
      </View>

      <View className="mt-2.5">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
            {data.sync.percentage}%
          </Text>
          <Text className="text-[11px] sm:text-xs font-semibold text-secondary">
            Sincronizado
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-[11px] sm:text-xs text-on-surface-variant truncate">
            Webhook ({data.sync.latencyMs}ms)
          </Text>
          <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
            <Text className="text-[10px] sm:text-[11px] font-medium text-on-surface">
              {data.sync.conflictCount} conf.
            </Text>
          </View>
        </View>
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
          <View className="w-[260px]">{card1}</View>
          <View className="w-[260px]">{card2}</View>
          <View className="w-[260px]">{card3}</View>
          <View className="w-[260px]">{card4}</View>
        </ScrollView>
      </View>

      {/* 2. Tablet & Desktop View: 4-Column Grid */}
      <View className="hidden sm:flex flex-row flex-wrap -m-2">
        <View className="w-1/2 xl:w-1/4 p-2">{card1}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{card2}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{card3}</View>
        <View className="w-1/2 xl:w-1/4 p-2">{card4}</View>
      </View>
    </View>
  );
}
