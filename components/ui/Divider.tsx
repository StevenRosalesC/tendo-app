import { Text, View } from "react-native";

export interface DividerProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className = "my-2" }: DividerProps) {
  if (!label) {
    return (
      <View
        className={`w-full h-[1px] bg-surface-container-high ${className}`}
      />
    );
  }

  return (
    <View className={`flex-row items-center gap-3 ${className}`}>
      <View className="flex-1 h-[1px] bg-surface-container-high" />
      <Text className="text-xs text-on-surface-variant font-medium">
        {label}
      </Text>
      <View className="flex-1 h-[1px] bg-surface-container-high" />
    </View>
  );
}
