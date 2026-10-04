import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export type AlertType = "error" | "success" | "warning" | "info";

export interface AlertBannerProps {
  message: string | null;
  type?: AlertType;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  {
    container: string;
    text: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    iconColor: string;
  }
> = {
  error: {
    container: "bg-status-danger/10 border-status-danger/30",
    text: "text-status-danger",
    icon: "error-outline",
    iconColor: "#EF4444",
  },
  success: {
    container: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    icon: "check-circle",
    iconColor: "#34D399",
  },
  warning: {
    container: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: "warning-amber",
    iconColor: "#FBBF24",
  },
  info: {
    container: "bg-primary/10 border-primary/30",
    text: "text-primary",
    icon: "info-outline",
    iconColor: "#c0c1ff",
  },
};

export default function AlertBanner({
  message,
  type = "error",
  className = "",
}: AlertBannerProps) {
  if (!message) return null;

  const config = alertConfig[type];

  return (
    <View
      className={`p-3 rounded-xl border flex-row items-center gap-2.5 ${config.container} ${className}`}
    >
      <MaterialIcons name={config.icon} size={16} color={config.iconColor} />
      <Text className={`text-xs flex-1 font-medium leading-relaxed ${config.text}`}>
        {message}
      </Text>
    </View>
  );
}
