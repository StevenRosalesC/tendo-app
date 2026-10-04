import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export interface ModulePlaceholderProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  badgeText?: string;
  children?: ReactNode;
}

export default function ModulePlaceholder({
  iconName,
  iconColor = "#c0c1ff",
  iconBgColor = "bg-surface-container-highest",
  title,
  description,
  badgeText,
  children,
}: ModulePlaceholderProps) {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl items-center">
        <View className="w-full rounded-3xl bg-surface-container-low p-8 border border-surface-container-high shadow-2xl items-center">
          <View
            className={`w-16 h-16 rounded-2xl ${iconBgColor} border border-surface-container-high items-center justify-center mb-4`}
          >
            <MaterialIcons name={iconName} size={32} color={iconColor} />
          </View>

          <Text className="text-2xl font-bold text-on-surface text-center">
            {title}
          </Text>

          <Text className="text-sm text-on-surface-variant mt-2 text-center max-w-md leading-relaxed">
            {description}
          </Text>

          {badgeText && (
            <View className="w-full mt-6 p-4 rounded-2xl bg-surface-container border border-surface-container-high items-center">
              <Text className="text-xs text-on-surface-variant font-medium">
                {badgeText}
              </Text>
            </View>
          )}

          {children}
        </View>
      </View>
    </ScrollView>
  );
}
