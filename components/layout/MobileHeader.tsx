import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import useCartStore from "../../stores/useCartStore";

export interface MobileHeaderProps {
  pageTitle: string;
  operatorInitial: string;
  onOpenOrder?: () => void;
  orderItemCount?: number;
  stationName?: string;
  shiftStatus?: string;
  isOnline?: boolean;
}

export default function MobileHeader({
  pageTitle,
  operatorInitial,
  onOpenOrder,
  orderItemCount,
  stationName = "Caja #04",
  shiftStatus = "Turno Activo",
  isOnline = true,
}: MobileHeaderProps) {
  const totalUnits = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openDrawer = useCartStore((s) => s.openDrawer);

  const itemCount = orderItemCount !== undefined ? orderItemCount : totalUnits;
  const handleOpenOrder = onOpenOrder || openDrawer;

  return (
    <View className="w-full bg-surface-container-lowest/80 border-b border-surface-container-high/40 px-4 py-3 flex md:hidden">
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <View
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-cyan-400" : "bg-error"
              }`}
            />
            <Text
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isOnline ? "text-cyan-300" : "text-error"
              }`}
            >
              {isOnline ? "WS Live" : "WS Off"}
            </Text>
          </View>
          <Text className="text-outline-variant font-medium">/</Text>
          <Text className="text-base font-bold text-on-surface">{pageTitle}</Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          {/* Botón de Pedido */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenOrder}
            accessibilityLabel="Abrir pedido actual"
            className="h-8 px-2.5 bg-primary-container rounded-lg flex-row items-center gap-1.5 border border-primary/30"
          >
            <MaterialIcons name="shopping-bag" size={16} color="#0d0096" />
            <Text className="text-xs font-bold text-on-primary-container">
              Pedido
            </Text>
            {itemCount > 0 && (
              <View className="min-w-[16px] h-[16px] px-1 rounded-full bg-primary items-center justify-center">
                <Text className="text-[10px] font-bold text-on-primary font-mono leading-none">
                  {itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="items-end hidden sm:flex">
            <Text className="text-xs font-bold text-on-surface leading-tight">
              {stationName}
            </Text>
            <Text className="text-[10px] text-on-surface-variant font-medium leading-tight">
              {shiftStatus}
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-sm">
            <Text className="text-xs font-bold text-on-primary">
              {operatorInitial}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
