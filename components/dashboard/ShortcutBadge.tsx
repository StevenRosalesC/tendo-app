import { Text, View } from "react-native";

export interface ShortcutBadgeProps {
  label: string;
  shortcut: string;
  shortcutColor?: string;
}

export default function ShortcutBadge({
  label,
  shortcut,
  shortcutColor = "text-primary",
}: ShortcutBadgeProps) {
  return (
    <View className="p-3 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row items-center justify-between">
      <Text className="text-xs text-on-surface-variant">{label}</Text>
      <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest">
        <Text className={`font-mono text-xs font-bold ${shortcutColor}`}>
          {shortcut}
        </Text>
      </View>
    </View>
  );
}
