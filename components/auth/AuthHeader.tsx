import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export interface AuthHeaderProps {
  badgeLabel?: string;
  badgeDotColor?: string;
  badgeIcon?: keyof typeof MaterialIcons.glyphMap;
}

export default function AuthHeader({
  badgeLabel = "Encrypted Node",
  badgeDotColor = "bg-primary",
  badgeIcon = "lock",
}: AuthHeaderProps) {
  return (
    <View className="w-full px-6 py-4 flex-row items-center justify-between border-b border-surface-container-high/40">
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl bg-surface-container-high items-center justify-center">
          <MaterialIcons name="point-of-sale" size={20} color="#c0c1ff" />
        </View>
        <View>
          <Text className="text-base font-bold text-on-surface tracking-tight">
            Tendo
          </Text>
          <Text className="text-xs text-on-surface-variant font-medium">
            Omnichannel OS
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container-high">
        <View className={`w-2 h-2 rounded-full ${badgeDotColor}`} />
        <MaterialIcons name={badgeIcon} size={13} color="#c0c1ff" />
        <Text className="text-xs font-medium text-on-surface-variant">
          {badgeLabel}
        </Text>
      </View>
    </View>
  );
}
