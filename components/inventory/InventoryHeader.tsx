import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export interface InventoryHeaderProps {
  totalProducts?: number;
  totalCategories?: number;
  onNewProduct?: () => void;
  onQuickAdjust?: () => void;
  onImportExport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function InventoryHeader({
  totalProducts = 0,
  totalCategories,
  onNewProduct,
  onQuickAdjust,
  onImportExport,
  onRefresh,
  isRefreshing = false,
}: InventoryHeaderProps) {
  return (
    <View className="flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Title & Stats */}
      <View className="flex-col gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Catálogo de Productos e Inventario
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-surface-container-high">
            <Text className="text-xs font-medium text-on-surface-variant">
              {totalProducts} Productos Totales
            </Text>
          </View>
          {totalCategories !== undefined && (
            <View className="px-2.5 py-0.5 rounded-full bg-surface-container-high">
              <Text className="text-xs font-medium text-on-surface-variant">
                {totalCategories} Categorías
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs sm:text-sm text-on-surface-variant">
          Gestión centralizada de stock multicanal, márgenes operativos y sincronización en mostrador
        </Text>
      </View>

      {/* Action Group */}
      <View className="flex-row items-center gap-2 flex-wrap">
        {/* Omnichannel Sync Pill */}
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high border border-surface-container-highest/40">
          <View className="w-2 h-2 rounded-full bg-secondary" />
          <Text className="text-xs font-medium text-on-surface">
            Sincronizado:
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-on-surface-variant">Tienda POS</Text>
            <Text className="text-xs text-on-surface-variant">•</Text>
            <Text className="text-xs text-on-surface-variant">Shopify</Text>
            <Text className="text-xs text-on-surface-variant">•</Text>
            <Text className="text-xs text-on-surface-variant">ML</Text>
          </View>
        </View>

        {/* Refresh Button */}
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            disabled={isRefreshing}
            activeOpacity={0.8}
            className="h-10 px-3.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 hover:bg-surface-bright flex-row items-center gap-2 shadow-sm"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#c0c1ff" />
            ) : (
              <MaterialIcons name="refresh" size={18} color="#c7c4d7" />
            )}
            <Text className="text-sm font-semibold text-on-surface">
              {isRefreshing ? "Actualizando..." : "Refrescar"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Stock Adjust Button */}
        <TouchableOpacity
          onPress={onQuickAdjust}
          activeOpacity={0.8}
          className="h-10 px-3.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 hover:bg-surface-bright flex-row items-center gap-2 shadow-sm"
        >
          <MaterialIcons name="tune" size={18} color="#c7c4d7" />
          <Text className="text-sm font-semibold text-on-surface">
            Ajuste Rápido
          </Text>
        </TouchableOpacity>

        {/* Import / Export CSV */}
        <TouchableOpacity
          onPress={onImportExport}
          activeOpacity={0.8}
          className="h-10 px-3.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 hover:bg-surface-bright flex-row items-center gap-2 shadow-sm"
        >
          <MaterialIcons name="swap-vert" size={18} color="#c7c4d7" />
          <Text className="text-sm font-semibold text-on-surface">
            Importar / Exportar
          </Text>
        </TouchableOpacity>

        {/* Primary Action: Nuevo Producto */}
        <TouchableOpacity
          onPress={onNewProduct}
          activeOpacity={0.85}
          className="h-10 px-4 rounded-lg bg-primary-container shadow-md flex-row items-center gap-2 active:scale-95"
        >
          <MaterialIcons name="add" size={20} color="#0d0096" />
          <Text className="text-sm font-bold text-on-primary-container">
            Nuevo Producto
          </Text>
          <View className="ml-1 px-1.5 py-0.5 rounded bg-on-primary-container/15">
            <Text className="text-xs font-semibold text-on-primary-container">
              F3
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
