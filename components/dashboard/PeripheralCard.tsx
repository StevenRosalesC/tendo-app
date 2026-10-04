import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export interface PeripheralCardProps {
  name: string;
  type: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  badgeText: string;
  badgeTextColor?: string;
}

export default function PeripheralCard({
  name,
  type,
  iconName,
  iconColor = "#c0c1ff",
  badgeText,
  badgeTextColor = "text-secondary",
}: PeripheralCardProps) {
  return (
    <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
      <View className="flex-row items-center gap-2.5">
        <View className="w-7 h-7 rounded-lg bg-surface-container-high items-center justify-center">
          <MaterialIcons name={iconName} size={15} color={iconColor} />
        </View>
        <View className="flex-col">
          <Text className="text-xs font-bold text-on-surface">{name}</Text>
          <Text className="text-[10px] text-on-surface-variant">{type}</Text>
        </View>
      </View>
      <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
        <Text className={`text-xs font-bold ${badgeTextColor}`}>
          {badgeText}
        </Text>
      </View>
    </View>
  );
}
