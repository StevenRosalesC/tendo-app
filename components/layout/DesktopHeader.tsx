import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export interface DesktopHeaderProps {
  pageTitle: string;
  sessionTime: string;
  operatorInitial: string;
  onLock: () => void;
  onSync?: () => void;
  stationName?: string;
  branchName?: string;
}

export default function DesktopHeader({
  pageTitle,
  sessionTime,
  operatorInitial,
  onLock,
  onSync,
  stationName = "Caja #04",
  branchName = "Sucursal Condesa",
}: DesktopHeaderProps) {
  return (
    <View className="h-16 bg-surface-container/90 border-b border-surface-container-high/60 px-6 hidden md:flex flex-row items-center justify-between z-40 backdrop-blur-md">
      <View className="flex-row items-center gap-4 min-w-0">
        <View className="flex-row items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <Text className="text-xs text-on-surface-variant font-medium">
            Tendo POS
          </Text>
          <MaterialIcons name="chevron-right" size={14} color="#908fa0" />
          <Text className="text-xs text-on-surface font-bold">{pageTitle}</Text>
        </View>

        <View className="h-4 w-[1px] bg-surface-container-highest" />

        <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-xs font-semibold text-on-surface">En línea</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="hidden lg:flex flex-row items-center gap-2 px-3 py-1 bg-surface-container-high rounded-lg text-xs border border-surface-container-highest/60">
          <MaterialIcons name="store" size={15} color="#c0c1ff" />
          <Text className="text-xs text-on-surface font-semibold">
            {stationName}
          </Text>
          <Text className="text-xs text-outline-variant">•</Text>
          <Text className="text-xs text-on-surface-variant">{branchName}</Text>
        </View>

        <View className="flex-row items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-lg border border-surface-container-highest/60">
          <MaterialIcons name="timer" size={15} color="#c3c0ff" />
          <Text className="text-xs font-mono font-bold text-on-surface">
            {sessionTime}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLock}
          className="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest rounded-lg flex-row items-center gap-1.5 border border-surface-container-highest/60"
        >
          <MaterialIcons name="lock" size={16} color="#c7c4d7" />
          <Text className="text-xs font-medium text-on-surface hidden xl:inline">
            Bloquear
          </Text>
        </TouchableOpacity>

        {onSync && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSync}
            className="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest rounded-lg flex-row items-center gap-1.5 border border-surface-container-highest/60"
          >
            <MaterialIcons name="sync" size={16} color="#c7c4d7" />
            <Text className="text-xs font-medium text-on-surface hidden xl:inline">
              Sincronizar
            </Text>
          </TouchableOpacity>
        )}

        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-1 shadow-sm">
          <Text className="text-xs font-bold text-on-primary">
            {operatorInitial}
          </Text>
        </View>
      </View>
    </View>
  );
}
