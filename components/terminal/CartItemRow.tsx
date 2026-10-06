import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CartItem } from "./types";

export interface CartItemRowProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = item.price * item.quantity;
  const isMaxStock =
    typeof item.stock === "number" && item.quantity >= item.stock;

  return (
    <View className="py-3 px-3 sm:px-4 rounded-2xl bg-surface-container/60 border border-surface-container-high/50 flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Product Info & Thumbnail */}
      <View className="flex-row items-center gap-3 flex-1 min-w-0">
        <View className="w-12 h-12 rounded-xl bg-surface-container-high border border-surface-container-highest/60 overflow-hidden items-center justify-center shrink-0">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <MaterialIcons name="inventory-2" size={20} color="#c0c1ff" />
          )}
        </View>

        <View className="flex-col flex-1 min-w-0">
          <Text
            numberOfLines={1}
            className="text-sm font-bold text-on-surface truncate"
          >
            {item.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
            <Text className="text-xs font-mono font-semibold text-primary">
              ${item.price.toFixed(2)}
            </Text>
            {item.barcode && (
              <>
                <Text className="text-xs text-on-surface-variant">•</Text>
                <Text className="text-[11px] font-mono text-on-surface-variant truncate">
                  {item.barcode}
                </Text>
              </>
            )}
            {item.category && (
              <>
                <Text className="text-xs text-on-surface-variant">•</Text>
                <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                  <Text className="text-[10px] text-on-surface-variant font-medium">
                    {item.category}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Stepper, Subtotal, and Delete */}
      <View className="flex-row items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/40">
        {/* Quantity Stepper */}
        <View className="flex-row items-center rounded-xl bg-surface-container-high border border-surface-container-highest/60 p-0.5">
          <TouchableOpacity
            onPress={() => onDecrement(item.id)}
            activeOpacity={0.7}
            accessibilityLabel="Disminuir cantidad"
            className="w-8 h-8 rounded-lg items-center justify-center bg-surface-container hover:bg-surface-container-lowest"
          >
            <MaterialIcons
              name={item.quantity === 1 ? "delete-outline" : "remove"}
              size={16}
              color={item.quantity === 1 ? "#ffb4ab" : "#c7c4d7"}
            />
          </TouchableOpacity>

          <View className="w-9 items-center justify-center">
            <Text className="text-sm font-bold font-mono text-on-surface">
              {item.quantity}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onIncrement(item.id)}
            disabled={isMaxStock}
            activeOpacity={0.7}
            accessibilityLabel="Aumentar cantidad"
            className={`w-8 h-8 rounded-lg items-center justify-center ${
              isMaxStock
                ? "bg-surface-container opacity-40"
                : "bg-surface-container hover:bg-surface-container-lowest"
            }`}
          >
            <MaterialIcons name="add" size={16} color="#c7c4d7" />
          </TouchableOpacity>
        </View>

        {/* Line Total */}
        <View className="items-end min-w-[75px]">
          <Text className="text-base font-bold font-mono text-on-surface">
            ${lineTotal.toFixed(2)}
          </Text>
          {item.quantity > 1 && (
            <Text className="text-[10px] text-on-surface-variant font-mono">
              ({item.quantity} × ${item.price.toFixed(2)})
            </Text>
          )}
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          activeOpacity={0.7}
          accessibilityLabel="Eliminar producto"
          className="w-8 h-8 rounded-lg items-center justify-center hover:bg-error-container/20"
        >
          <MaterialIcons name="close" size={18} color="#908fa0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
