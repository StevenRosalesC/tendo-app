import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import TendoLogo from "../ui/TendoLogo";

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
        <TendoLogo variant="emblem" size={32} color="#017AF6" />
        <View>
          <TendoLogo variant="wordmark" height={16} color="#FFFFFF" />
          <Text className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase leading-none mt-1">
            Punto de Venta
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
