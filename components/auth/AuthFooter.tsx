import { Text, View } from "react-native";

export interface AuthFooterProps {
  copyrightText?: string;
  secondaryText?: string;
  items?: string[];
}

export default function AuthFooter({
  copyrightText = "Tendo Enterprise Terminal Network © 2025",
  secondaryText,
  items,
}: AuthFooterProps) {
  return (
    <View className="w-full px-6 py-4 border-t border-surface-container-high/40 flex-col sm:flex-row items-center justify-between gap-2">
      <Text className="text-xs text-on-surface-variant">{copyrightText}</Text>

      {secondaryText ? (
        <Text className="text-xs text-on-surface-variant">{secondaryText}</Text>
      ) : items && items.length > 0 ? (
        <View className="flex-row items-center gap-3">
          {items.map((item, index) => (
            <View key={item} className="flex-row items-center gap-3">
              {index > 0 && <Text className="text-tertiary-container">•</Text>}
              <Text className="text-xs text-on-surface-variant">{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-row items-center gap-3">
          <Text className="text-xs text-on-surface-variant">
            Hardware Diagnostics
          </Text>
          <Text className="text-tertiary-container">•</Text>
          <Text className="text-xs text-on-surface-variant">
            Security Policy
          </Text>
        </View>
      )}
    </View>
  );
}
