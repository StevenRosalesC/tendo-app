import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Product } from "./types";

export interface InventoryGridItemProps {
  product: Product;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  onQuickAddStock?: (id: string) => void;
  onPrintBarcode?: (id: string) => void;
  onEditProduct?: (id: string) => void;
  onMoreOptions?: (id: string) => void;
}

export default function InventoryGridItem({
  product,
  isSelected = false,
  onToggleSelect,
  onToggleAvailability,
  onQuickAddStock,
  onPrintBarcode,
  onEditProduct,
  onMoreOptions,
}: InventoryGridItemProps) {
  const isOutOfStock = product.stockWarning === "out_of_stock";
  const isLowStock = product.stockWarning === "low_stock";

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
      <View className="w-full h-36 rounded-lg overflow-hidden bg-surface-container-high relative">
        <Image
          source={{ uri: product.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

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

        {/* Category Badge */}
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
          <TouchableOpacity
            onPress={() => onToggleAvailability?.(product.id)}
            className={`w-8 h-4 rounded-full relative p-0.5 flex-row items-center ml-2 ${
              product.available ? "bg-primary" : "bg-surface-container-high"
            }`}
          >
            <View
              className={`w-3 h-3 rounded-full shadow-sm ${
                product.available
                  ? "bg-on-primary ml-auto"
                  : "bg-on-surface-variant mr-auto"
              }`}
            />
          </TouchableOpacity>
        </View>

        {/* SKU and Barcode */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-semibold text-on-surface font-mono">
            {product.sku}
          </Text>
          <Text className="text-xs text-on-surface-variant">•</Text>
          <Text className="text-[11px] font-mono text-on-surface-variant">
            {product.barcode}
          </Text>
        </View>

        {/* Stock Status */}
        <View className="flex-row items-center justify-between mt-1">
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
              {product.stock} uds
            </Text>
          </View>

          <Text
            className={`text-xs ${
              isLowStock || isOutOfStock
                ? "text-error font-medium"
                : "text-on-surface-variant"
            }`}
          >
            {product.stockWarningText || product.stockBreakdown || "POS Físico"}
          </Text>
        </View>

        {/* Price & Margins */}
        <View className="flex-row items-baseline justify-between mt-2 pt-2 border-t border-surface-container-high/40">
          <Text className="text-base font-bold text-on-surface font-mono">
            ${product.price.toFixed(2)}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            Costo: ${product.cost.toFixed(2)} ({product.margin}% mg)
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-surface-container-high/40">
        <View className="flex-row items-center gap-1">
          {product.channels.map((ch) => (
            <View
              key={ch}
              className="px-1.5 py-0.5 rounded bg-surface-container-high flex-row items-center gap-0.5"
            >
              <MaterialIcons
                name={ch === "POS" ? "point-of-sale" : "language"}
                size={11}
                color="#c7c4d7"
              />
              <Text className="text-[10px] text-on-surface-variant font-medium">
                {ch}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => onQuickAddStock?.(product.id)}
            className="w-7 h-7 rounded hover:bg-surface-container-high items-center justify-center"
          >
            <MaterialIcons name="add-circle" size={16} color="#c7c4d7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onEditProduct?.(product.id)}
            className="w-7 h-7 rounded hover:bg-surface-container-high items-center justify-center"
          >
            <MaterialIcons name="edit" size={16} color="#c7c4d7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoreOptions?.(product.id)}
            className="w-7 h-7 rounded hover:bg-surface-container-high items-center justify-center"
          >
            <MaterialIcons name="more-vert" size={16} color="#c7c4d7" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
