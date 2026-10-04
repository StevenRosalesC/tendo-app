import { Text, View } from "react-native";

export interface MobileHeaderProps {
  pageTitle: string;
  operatorInitial: string;
  stationName?: string;
  shiftStatus?: string;
  isOnline?: boolean;
}

export default function MobileHeader({
  pageTitle,
  operatorInitial,
  stationName = "Caja #04",
  shiftStatus = "Turno Activo",
  isOnline = true,
}: MobileHeaderProps) {
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

        <View className="flex-row items-center gap-3">
          <View className="items-end">
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
