import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Text, View } from "react-native";

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  trendText?: string;
  trendPositive?: boolean;
  trendIcon?: keyof typeof MaterialIcons.glyphMap;
  extraHeader?: ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  iconName,
  iconColor = "#0d0096",
  iconBgColor = "bg-primary-container",
  trendText,
  trendPositive = true,
  trendIcon,
  extraHeader,
}: StatCardProps) {
  return (
    <View className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container-high shadow-md justify-between">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View
            className={`w-9 h-9 rounded-xl ${iconBgColor} items-center justify-center`}
          >
            <MaterialIcons name={iconName} size={20} color={iconColor} />
          </View>
          <Text className="text-xs font-semibold text-on-surface-variant">
            {title}
          </Text>
        </View>

        {extraHeader}

        {trendText && (
          <View
            className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
              trendPositive
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-surface-container-high border border-surface-container-highest"
            }`}
          >
            {trendIcon && (
              <MaterialIcons
                name={trendIcon}
                size={13}
                color={trendPositive ? "#34D399" : "#c7c4d7"}
              />
            )}
            <Text
              className={`text-[11px] font-bold ${
                trendPositive ? "text-emerald-400" : "text-on-surface-variant"
              }`}
            >
              {trendText}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-3">
        <Text className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
          {value}
        </Text>
        {subtitle && (
          <Text className="text-[11px] text-on-surface-variant font-medium mt-1">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
