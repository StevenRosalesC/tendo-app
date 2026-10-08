import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import usePermissions from "../../hooks/usePermissions";
import { AppAction, AppResource } from "../../types/permissions.types";
import { Product } from "./types";

export interface InventoryGridItemProps {
  product: Product;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEditProduct?: (id: string) => void;
  onMoreOptions?: (id: string) => void;
}

const UNIT_SHORT: Record<string, string> = {
  UNIT: "u",
  KG: "kg",
  LB: "lb",
  G: "g",
  L: "L",
  ML: "ml",
  M: "m",
};

export default function InventoryGridItem({
  product,
  isSelected = false,
  onToggleSelect,
  onEditProduct,
  onMoreOptions,
}: InventoryGridItemProps) {
  const { can } = usePermissions();
  const canUpdateProducts = can(AppResource.PRODUCTS, AppAction.UPDATE);
  const canViewCosts = can(AppResource.REPORTS, AppAction.READ) || canUpdateProducts;
  const isOutOfStock = product.stockWarning === "out_of_stock";
  const isLowStock = product.stockWarning === "low_stock";
  const isTracked = product.trackStock !== false;
  const unitSuffix = product.unit ? UNIT_SHORT[product.unit] || "u" : "u";

  return (
    <View
      className={`rounded-2xl bg-surface-container border p-3 flex-col justify-between shadow-sm relative overflow-hidden min-h-[220px] ${
        isSelected
          ? "border-primary"
          : isLowStock
          ? "border-error/40 bg-error-container/10"
          : "border-surface-container-high/60"
      }`}
    >
      {/* Top Image & Overlays */}
      <View className="w-full h-36 rounded-lg overflow-hidden bg-surface-container-high relative items-center justify-center">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <MaterialIcons name="inventory-2" size={32} color="#938f99" />
        )}

        {/* Selection Checkbox */}
        <TouchableOpacity
          onPress={() => onToggleSelect?.(product.id)}
          className={`absolute top-2 left-2 w-5 h-5 rounded border items-center justify-center ${
            isSelected
              ? "bg-primary border-primary"
              : "bg-surface-container-lowest/80 border-surface-container-high"
          }`}
        >
          {isSelected && <MaterialIcons name="check" size={14} color="#1000a9" />}
        </TouchableOpacity>

        {/* Status / Category Badge */}
        <View className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
          <Text className="text-[10px] font-semibold text-on-surface">
            {product.category}
          </Text>
        </View>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-surface-container-lowest/75 items-center justify-center gap-1">
            <MaterialIcons name="block" size={24} color="#ffb4ab" />
            <Text className="text-xs font-bold text-error uppercase">
              Agotado
            </Text>
          </View>
        )}
      </View>

      {/* Product Information */}
      <View className="mt-3 flex-col gap-1">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className="text-sm font-bold text-on-surface truncate flex-1"
          >
            {product.name}
          </Text>
          {/* Status Chip */}
          {!isTracked ? (
            <View className="px-2 py-0.2 rounded bg-secondary/15 ml-2">
              <Text className="text-[10px] font-bold text-secondary uppercase">
                Venta Libre
              </Text>
            </View>
          ) : isLowStock ? (
            <View className="px-2 py-0.2 rounded bg-error-container ml-2">
              <Text className="text-[10px] font-bold text-on-error-container uppercase">
                Bajo Stock
              </Text>
            </View>
          ) : null}
        </View>

        {/* SKU and Barcode */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-semibold text-on-surface font-mono">
            {product.sku}
          </Text>
          <Text className="text-xs text-on-surface-variant">•</Text>
          <Text className="text-[11px] font-mono text-on-surface-variant">
            {product.barcode || "Sin código"}
          </Text>
        </View>

        {/* Stock Status */}
        <View className="flex-row items-center justify-between mt-1">
          {!isTracked ? (
            <View className="px-2.5 py-0.5 rounded-full bg-surface-container border border-surface-container-highest">
              <Text className="text-xs font-bold text-primary">
                Ilimitado
              </Text>
            </View>
          ) : (
            <View
              className={`px-2.5 py-0.5 rounded-full ${
                isLowStock
                  ? "bg-error-container"
                  : isOutOfStock
                  ? "bg-surface-variant"
                  : "bg-secondary/15"
              }`}
            >
              <Text
                className={`text-xs font-bold font-mono ${
                  isLowStock
                    ? "text-on-error-container"
                    : isOutOfStock
                    ? "text-on-surface-variant"
                    : "text-secondary"
                }`}
              >
                {product.stock} {unitSuffix}
              </Text>
            </View>
          )}

          <Text
            className={`text-xs ${
              isLowStock || isOutOfStock
                ? "text-error font-medium"
                : "text-on-surface-variant"
            }`}
          >
            {!isTracked
              ? "Sin control"
              : product.stockWarningText || "En mostrador"}
          </Text>
        </View>

        {/* Price & Margins */}
        <View className="flex-row items-baseline justify-between mt-2 pt-2 border-t border-surface-container-high/40">
          <Text className="text-base font-bold text-on-surface font-mono">
            ${product.price.toFixed(2)}
            {product.unit && product.unit !== "UNIT" ? ` /${unitSuffix}` : ""}
          </Text>
          {canViewCosts && (
            <Text className="text-[11px] text-on-surface-variant">
              Costo: ${product.cost.toFixed(2)} ({product.margin}% mg)
            </Text>
          )}
        </View>
      </View>

      {/* Action Row */}
      <View className="flex-row items-center justify-end gap-1.5 mt-3 pt-2 border-t border-surface-container-high/40">
        {canUpdateProducts && (
          <TouchableOpacity
            onPress={() => onEditProduct?.(product.id)}
            activeOpacity={0.7}
            className="h-8 px-3 rounded-lg bg-surface-container-high flex-row items-center gap-1.5"
          >
            <MaterialIcons name="edit" size={15} color="#c7c4d7" />
            <Text className="text-xs font-medium text-on-surface">Editar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onMoreOptions?.(product.id)}
          activeOpacity={0.7}
          className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center"
        >
          <MaterialIcons name="more-vert" size={16} color="#c7c4d7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
