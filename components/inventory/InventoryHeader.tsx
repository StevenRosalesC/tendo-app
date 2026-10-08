import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface InventoryHeaderProps {
  totalProducts?: number;
  totalCategories?: number;
  onNewProduct?: () => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function InventoryHeader({
  totalProducts = 0,
  totalCategories,
  onNewProduct,
  onExportCsv,
  isExporting = false,
  onRefresh,
  isRefreshing = false,
}: InventoryHeaderProps) {
  return (
    <View className="flex-col gap-2.5 sm:gap-4">
      {/* Top Row: Title, Pill & Primary CTA */}
      <View className="flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Product Count */}
        <View className="flex-col gap-0.5">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Inventario de Productos
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
              <Text className="text-[11px] sm:text-xs font-semibold text-on-surface-variant font-mono">
                {totalProducts} {totalProducts === 1 ? "artículo" : "artículos"}
              </Text>
            </View>
            {totalCategories !== undefined && (
              <View className="hidden sm:flex px-2 py-0.5 rounded-full bg-surface-container-high">
                <Text className="text-xs font-medium text-on-surface-variant">
                  {totalCategories} categorías
                </Text>
              </View>
            )}
          </View>

          <Text className="text-xs text-on-surface-variant hidden sm:flex">
            Gestión centralizada de existencias, precios y sincronización de mostrador.
          </Text>
        </View>

        {/* Primary Action Button (Nuevo Producto) */}
        {onNewProduct && (
          <TouchableOpacity
            onPress={onNewProduct}
            activeOpacity={0.85}
            className="h-10 px-3.5 sm:px-4 rounded-xl bg-primary-container flex-row items-center justify-center gap-2 shrink-0"
          >
            <MaterialIcons name="add" size={18} color="#0d0096" />
            <Text className="text-xs sm:text-sm font-bold text-on-primary-container">
              Nuevo Producto
            </Text>
            <View className="hidden sm:flex ml-0.5 px-1.5 py-0.2 rounded bg-on-primary-container/15">
              <Text className="text-[10px] font-mono font-bold text-on-primary-container">
                F3
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Secondary Actions: Quick Adjust, Export CSV, Refresh */}
      <View className="w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row items-center gap-2 py-0.5"
        >
          {/* Refresh Button */}
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              disabled={isRefreshing}
              activeOpacity={0.8}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#c0c1ff" />
              ) : (
                <MaterialIcons name="refresh" size={15} color="#c7c4d7" />
              )}
              <Text className="text-xs font-semibold text-on-surface">
                {isRefreshing ? "..." : "Refrescar"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Export CSV */}
          {onExportCsv && (
            <TouchableOpacity
              onPress={onExportCsv}
              disabled={isExporting}
              activeOpacity={0.8}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5"
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#c0c1ff" />
              ) : (
                <MaterialIcons name="file-download" size={15} color="#c7c4d7" />
              )}
              <Text className="text-xs font-semibold text-on-surface">
                {isExporting ? "Generando..." : "Exportar CSV"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
