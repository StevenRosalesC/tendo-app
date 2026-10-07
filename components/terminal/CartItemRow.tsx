import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CartItem } from "./types";

export interface CartItemRowProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onEditQuantity?: (item: CartItem) => void;
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

export default function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onEditQuantity,
}: CartItemRowProps) {
  const lineTotal = item.price * item.quantity;
  const isTracked = item.trackStock !== false;
  const isMaxStock =
    isTracked && typeof item.stock === "number" && item.quantity >= item.stock;
  const unitSuffix = item.unit ? UNIT_SHORT[item.unit] || "u" : "u";

  return (
    <View className="p-3 rounded-2xl bg-surface-container/70 border border-surface-container-high/60 flex-col gap-2 hover:bg-surface-bright transition-colors shadow-xs">
      {/* Top Row: Thumbnail, Product Title, Unit Price, and Remove */}
      <View className="flex-row items-center justify-between gap-2.5">
        <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
          <View className="w-9 h-9 rounded-xl bg-surface-container-high border border-surface-container-highest/60 overflow-hidden items-center justify-center shrink-0">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="inventory-2" size={17} color="#c0c1ff" />
            )}
          </View>

          <View className="flex-col flex-1 min-w-0">
            <Text
              numberOfLines={1}
              className="text-xs font-bold text-on-surface truncate"
            >
              {item.name}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5 flex-wrap">
              <Text className="text-[11px] font-mono font-semibold text-primary">
                ${item.price.toFixed(2)} /{unitSuffix}
              </Text>
              {item.barcode && (
                <>
                  <Text className="text-[10px] text-on-surface-variant">•</Text>
                  <Text className="text-[10px] font-mono text-on-surface-variant truncate">
                    {item.barcode}
                  </Text>
                </>
              )}
              {!isTracked && (
                <View className="px-1.5 py-0.2 rounded bg-amber-500/20">
                  <Text className="text-[9px] text-amber-300 font-medium">
                    A granel
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Delete Row Button */}
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          activeOpacity={0.7}
          accessibilityLabel="Eliminar producto"
          className="w-7 h-7 rounded-lg items-center justify-center hover:bg-error-container/20 active:scale-95"
        >
          <MaterialIcons name="close" size={16} color="#908fa0" />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Quantity Stepper & Line Total */}
      <View className="flex-row items-center justify-between pt-1.5 border-t border-surface-container-high/40">
        {/* Stepper */}
        <View className="flex-row items-center rounded-xl bg-surface-container-high border border-surface-container-highest/60 p-0.5">
          <TouchableOpacity
            onPress={() => onDecrement(item.id)}
            activeOpacity={0.7}
            accessibilityLabel="Disminuir cantidad"
            className="w-7 h-7 rounded-lg items-center justify-center bg-surface-container hover:bg-surface-container-lowest active:scale-95"
          >
            <MaterialIcons
              name={item.quantity <= 1 ? "delete-outline" : "remove"}
              size={14}
              color={item.quantity <= 1 ? "#ffb4ab" : "#c7c4d7"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onEditQuantity?.(item)}
            activeOpacity={0.7}
            accessibilityLabel="Modificar cantidad directamente"
            className="px-2 min-w-[32px] items-center justify-center rounded hover:bg-surface-container active:bg-surface-container-highest"
          >
            <Text className="text-xs font-bold font-mono text-on-surface">
              {item.quantity} {unitSuffix}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onIncrement(item.id)}
            disabled={isMaxStock}
            activeOpacity={0.7}
            accessibilityLabel="Aumentar cantidad"
            className={`w-7 h-7 rounded-lg items-center justify-center ${
              isMaxStock
                ? "bg-surface-container opacity-40"
                : "bg-surface-container hover:bg-surface-container-lowest active:scale-95"
            }`}
          >
            <MaterialIcons name="add" size={14} color="#c7c4d7" />
          </TouchableOpacity>
        </View>

        {/* Line Total */}
        <View className="items-end">
          <Text className="text-sm font-bold font-mono text-on-surface">
            ${lineTotal.toFixed(2)}
          </Text>
          {item.quantity > 1 && (
            <Text className="text-[10px] text-on-surface-variant font-mono">
              ({item.quantity} × ${item.price.toFixed(2)})
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
