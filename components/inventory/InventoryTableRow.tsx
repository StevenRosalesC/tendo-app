import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "../../stores/useAuthStore";
import { TableData, TableRow } from "../ui/Table";
import { Product } from "./types";

export interface InventoryTableRowProps {
  product: Product;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  onQuickAddStock?: (id: string) => void;
  onPrintBarcode?: (id: string) => void;
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
  onToggleAvailability,
  onQuickAddStock,
  onPrintBarcode,
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
      {/* Selection Checkbox */}
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

      {/* Product Image, Name, SKU, Barcode */}
      <TableData className="flex-1 min-w-[280px]">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high border border-surface-container-highest/40 relative">
            <Image
              source={{ uri: product.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
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

      {/* Category */}
      <TableData className="w-28">
        <View className="px-2.5 py-1 rounded bg-surface-container self-start">
          <Text className="text-xs text-on-surface-variant font-medium">
            {product.category}
          </Text>
        </View>
      </TableData>

      {/* Current Stock */}
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
            ? "A granel"
            : product.stockWarningText || product.stockBreakdown || "POS Físico"}
        </Text>
      </TableData>

      {/* Sale Price & Margins */}
      <TableData className="w-36" align="right">
        <Text className="text-sm font-bold text-on-surface font-mono">
          ${product.price.toFixed(2)}
          {product.unit && product.unit !== "UNIT" ? ` /${unitSuffix}` : ""}
        </Text>
        {isManagerOrAdmin && (
          <Text className="text-[11px] text-on-surface-variant">
            Costo: ${product.cost.toFixed(2)} ({product.margin}% mg)
          </Text>
        )}
      </TableData>

      {/* Active Channels */}
      <TableData className="w-36" align="center">
        <View className="flex-row items-center gap-1 justify-center">
          {product.channels.map((ch) => (
            <View
              key={ch}
              className="px-2 py-0.5 rounded bg-surface-container flex-row items-center gap-1"
            >
              <MaterialIcons
                name={ch === "POS" ? "point-of-sale" : "language"}
                size={12}
                color="#c7c4d7"
              />
              <Text className="text-[11px] text-on-surface-variant font-medium">
                {ch}
              </Text>
            </View>
          ))}
        </View>
      </TableData>

      {/* Availability Toggle */}
      <TableData className="w-24" align="center">
        <TouchableOpacity
          onPress={() => onToggleAvailability?.(product.id)}
          className={`w-10 h-5 rounded-full relative p-0.5 flex-row items-center ${
            product.available ? "bg-primary" : "bg-surface-container-high"
          }`}
        >
          <View
            className={`w-4 h-4 rounded-full shadow-sm ${
              product.available
                ? "bg-on-primary ml-auto"
                : "bg-on-surface-variant mr-auto"
            }`}
          />
        </TouchableOpacity>
      </TableData>

      {/* Quick Action Buttons */}
      <TableData className="w-40" align="right">
        <View className="flex-row items-center justify-end gap-1">
          <TouchableOpacity
            onPress={() => onQuickAddStock?.(product.id)}
            className="w-8 h-8 rounded hover:bg-surface-container-high items-center justify-center"
            accessibilityLabel="Ajuste rápido de unidades"
          >
            <MaterialIcons name="add-circle" size={18} color="#c7c4d7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onPrintBarcode?.(product.id)}
            className="w-8 h-8 rounded hover:bg-surface-container-high items-center justify-center"
            accessibilityLabel="Imprimir etiqueta código de barras"
          >
            <MaterialIcons name="print" size={18} color="#c7c4d7" />
          </TouchableOpacity>

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
