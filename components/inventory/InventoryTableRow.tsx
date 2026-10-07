import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "../../stores/useAuthStore";
import { TableData, TableRow } from "../ui/Table";
import { Product } from "./types";

export interface InventoryTableRowProps {
  product: Product;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEditProduct?: (id: string) => void;
  onMoreOptions?: (id: string) => void;
  isAlternate?: boolean;
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

export default function InventoryTableRow({
  product,
  isSelected = false,
  onToggleSelect,
  onEditProduct,
  onMoreOptions,
  isAlternate = false,
}: InventoryTableRowProps) {
  const isManagerOrAdmin = useAuthStore((s) => s.isManager());
  const isOutOfStock = product.stockWarning === "out_of_stock";
  const isLowStock = product.stockWarning === "low_stock";
  const isTracked = product.trackStock !== false;
  const unitSuffix = product.unit ? UNIT_SHORT[product.unit] || "u" : "u";

  const customRowClass = isLowStock
    ? "bg-error-container/10 hover:bg-error-container/20"
    : isOutOfStock
    ? "opacity-75 bg-surface-container-lowest/20 hover:bg-surface-container"
    : "";

  return (
    <TableRow
      isSelected={isSelected}
      isAlternate={isAlternate}
      className={customRowClass}
    >
      {/* 1. Selection Checkbox */}
      <TableData className="w-10">
        <TouchableOpacity
          onPress={() => onToggleSelect?.(product.id)}
          className={`w-4 h-4 rounded border items-center justify-center ${
            isSelected
              ? "bg-primary border-primary"
              : "bg-surface-container-high border-surface-container-highest"
          }`}
        >
          {isSelected && <MaterialIcons name="check" size={12} color="#1000a9" />}
        </TouchableOpacity>
      </TableData>

      {/* 2. Product Name, SKU, Barcode, Image/Placeholder */}
      <TableData className="flex-1 min-w-[280px]">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high border border-surface-container-highest/40 relative items-center justify-center">
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="inventory-2" size={20} color="#938f99" />
            )}
            {isOutOfStock && (
              <View className="absolute inset-0 bg-surface-container-lowest/70 items-center justify-center">
                <MaterialIcons name="block" size={16} color="#ffb4ab" />
              </View>
            )}
          </View>

          <View className="flex-col min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <Text
                numberOfLines={1}
                className="text-sm font-semibold text-on-surface truncate"
              >
                {product.name}
              </Text>
              {isLowStock && (
                <View className="px-1.5 py-0.2 rounded bg-error-container">
                  <Text className="text-[10px] font-bold text-on-error-container uppercase">
                    Bajo Stock
                  </Text>
                </View>
              )}
              {isOutOfStock && (
                <View className="px-1.5 py-0.2 rounded bg-surface-variant">
                  <Text className="text-[10px] font-bold text-on-surface-variant uppercase">
                    Agotado
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-xs font-semibold text-on-surface font-mono">
                SKU: {product.sku}
              </Text>
              <Text className="text-xs text-on-surface-variant">•</Text>
              <View className="flex-row items-center gap-1">
                <MaterialIcons
                  name={product.barcode ? "qr-code-scanner" : "horizontal-rule"}
                  size={12}
                  color="#c7c4d7"
                />
                <Text className="text-[11px] font-mono text-on-surface-variant">
                  {product.barcode || "Sin código"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TableData>

      {/* 3. Category */}
      <TableData className="w-28">
        <View className="px-2.5 py-1 rounded bg-surface-container self-start">
          <Text className="text-xs text-on-surface-variant font-medium">
            {product.category}
          </Text>
        </View>
      </TableData>

      {/* 4. Current Stock */}
      <TableData className="w-32" align="center">
        {!isTracked ? (
          <View className="px-3 py-1 rounded-full bg-surface-container border border-surface-container-highest">
            <Text className="text-xs font-bold text-primary">
              Ilimitado
            </Text>
          </View>
        ) : (
          <View
            className={`px-3 py-1 rounded-full ${
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
          className={`text-[11px] mt-0.5 ${
            isLowStock || isOutOfStock
              ? "text-error font-medium"
              : "text-on-surface-variant"
          }`}
        >
          {!isTracked
            ? "Sin control de stock"
            : product.stockWarningText || "Disponible en mostrador"}
        </Text>
      </TableData>

      {/* 5. Sale Price */}
      <TableData className="w-32" align="right">
        <Text className="text-sm font-bold text-on-surface font-mono">
          ${product.price.toFixed(2)}
          {product.unit && product.unit !== "UNIT" ? ` /${unitSuffix}` : ""}
        </Text>
      </TableData>

      {/* 6. Cost & Profit Margin */}
      <TableData className="w-36" align="right">
        {isManagerOrAdmin ? (
          <View className="items-end">
            <Text className="text-xs font-semibold text-on-surface font-mono">
              ${product.cost.toFixed(2)}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                <Text className="text-[10px] font-bold text-secondary">
                  {product.margin}% mg
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-xs text-on-surface-variant">—</Text>
        )}
      </TableData>

      {/* 7. Real Inventory Status Badge */}
      <TableData className="w-32" align="center">
        {!isTracked ? (
          <View className="px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20">
            <Text className="text-[11px] font-semibold text-secondary">
              Venta Libre
            </Text>
          </View>
        ) : isOutOfStock ? (
          <View className="px-2.5 py-1 rounded-md bg-error/10 border border-error/20">
            <Text className="text-[11px] font-semibold text-error">
              Agotado
            </Text>
          </View>
        ) : isLowStock ? (
          <View className="px-2.5 py-1 rounded-md bg-error-container border border-error/30">
            <Text className="text-[11px] font-semibold text-on-error-container">
              Bajo Stock
            </Text>
          </View>
        ) : (
          <View className="px-2.5 py-1 rounded-md bg-surface-container border border-surface-container-highest">
            <Text className="text-[11px] font-semibold text-on-surface">
              Disponible
            </Text>
          </View>
        )}
      </TableData>

      {/* 8. Quick Action Buttons */}
      <TableData className="w-28" align="right">
        <View className="flex-row items-center justify-end gap-1">
          <TouchableOpacity
            onPress={() => onEditProduct?.(product.id)}
            className="w-8 h-8 rounded hover:bg-surface-container-high items-center justify-center"
            accessibilityLabel="Editar producto"
          >
            <MaterialIcons name="edit" size={18} color="#c7c4d7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onMoreOptions?.(product.id)}
            className="w-8 h-8 rounded hover:bg-surface-container-high items-center justify-center"
            accessibilityLabel="Más opciones"
          >
            <MaterialIcons name="more-vert" size={18} color="#c7c4d7" />
          </TouchableOpacity>
        </View>
      </TableData>
    </TableRow>
  );
}
