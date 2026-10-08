import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import TendoLogo from "../ui/TendoLogo";

import useCartStore from "../../stores/useCartStore";

export interface DesktopHeaderProps {
  pageTitle: string;
  sessionTime?: string;
  operatorInitial: string;
  onLock: () => void;
  onOpenOrder?: () => void;
  orderItemCount?: number;
  stationName?: string;
  branchName?: string;
  isOnline?: boolean;
}

export default function DesktopHeader({
  pageTitle,
  sessionTime,
  operatorInitial,
  onLock,
  onOpenOrder,
  orderItemCount,
  stationName = "Estación POS",
  branchName = "Sucursal Central",
  isOnline = true,
}: DesktopHeaderProps) {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    if (sessionTime) return;
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sessionTime]);

  const displayTime = sessionTime || localTime;

  const totalUnits = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openDrawer = useCartStore((s) => s.openDrawer);

  const itemCount = orderItemCount !== undefined ? orderItemCount : totalUnits;
  const handleOpenOrder = onOpenOrder || openDrawer;
  return (
    <View className="h-16 bg-surface-container/90 border-b border-surface-container-high/60 px-6 hidden md:flex flex-row items-center justify-between z-40 backdrop-blur-md">
      <View className="flex-row items-center gap-4 min-w-0">
        <View className="flex-row items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <TendoLogo variant="emblem" size={16} color="#017AF6" />
          <Text className="text-xs text-on-surface-variant font-semibold">
            Tendo POS
          </Text>
          <MaterialIcons name="chevron-right" size={14} color="#908fa0" />
          <Text className="text-xs text-on-surface font-bold">{pageTitle}</Text>
        </View>

        <View className="h-4 w-[1px] bg-surface-container-highest" />

        <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high">
          <View
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-primary" : "bg-error"
            }`}
          />
          <Text className="text-xs font-semibold text-on-surface">
            {isOnline ? "En línea" : "Desconectado"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 sm:gap-3 shrink-0">
        <View className="hidden xl:flex flex-row items-center gap-2 px-3 py-1 bg-surface-container-high rounded-lg text-xs border border-surface-container-highest/60">
          <MaterialIcons name="store" size={15} color="#c0c1ff" />
          <Text className="text-xs text-on-surface font-semibold">
            {stationName}
          </Text>
          <Text className="text-xs text-outline-variant">•</Text>
          <Text className="text-xs text-on-surface-variant">{branchName}</Text>
        </View>

        <View className="flex-row items-center gap-1.5 bg-surface-container-high px-2.5 sm:px-3 py-1 rounded-lg border border-surface-container-highest/60">
          <MaterialIcons name="timer" size={15} color="#c3c0ff" />
          <Text className="text-xs font-mono font-bold text-on-surface">
            {displayTime}
          </Text>
        </View>

        {/* Botón de Pedido */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenOrder}
          accessibilityLabel="Abrir pedido actual"
          className="h-9 px-3 bg-primary-container rounded-lg flex-row items-center gap-2 border border-primary/30"
        >
          <MaterialIcons name="shopping-bag" size={17} color="#0d0096" />
          <Text className="text-xs font-bold text-on-primary-container">
            Pedido
          </Text>
          {itemCount > 0 && (
            <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary items-center justify-center">
              <Text className="text-[10px] font-bold text-on-primary font-mono leading-none">
                {itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLock}
          accessibilityLabel="Bloquear terminal"
          className="h-9 px-2.5 sm:px-3 bg-surface-container-high rounded-lg flex-row items-center gap-1.5 border border-surface-container-highest/60"
        >
          <MaterialIcons name="lock" size={16} color="#c7c4d7" />
          <Text className="text-xs font-medium text-on-surface hidden 2xl:inline">
            Bloquear
          </Text>
        </TouchableOpacity>

        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-0.5 sm:ml-1">
          <Text className="text-xs font-bold text-on-primary">
            {operatorInitial}
          </Text>
        </View>
      </View>
    </View>
  );
}
