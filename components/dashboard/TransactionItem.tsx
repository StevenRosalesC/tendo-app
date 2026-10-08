import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export interface TransactionData {
  id: string;
  ticketNumber: string;
  paymentLabel: string;
  timeAgo: string;
  productsSummary: string;
  amount: string;
  statusBadge: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
}

export interface TransactionItemProps {
  transaction: TransactionData;
}

export default function TransactionItem({ transaction: tx }: TransactionItemProps) {
  return (
    <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
      <View className="flex-row items-center gap-3 min-w-0 flex-1 mr-3">
        <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center shrink-0">
          <MaterialIcons name={tx.iconName} size={20} color={tx.iconColor} />
        </View>
        <View className="flex-col min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-on-surface font-mono">
              {tx.ticketNumber}
            </Text>
            <Text className="text-outline-variant text-[10px]">•</Text>
            <Text className="text-xs font-medium text-secondary">
              {tx.paymentLabel}
            </Text>
            <Text className="text-outline-variant text-[10px]">•</Text>
            <Text className="text-xs text-on-surface-variant">{tx.timeAgo}</Text>
          </View>
          <Text className="text-xs text-on-surface-variant truncate mt-0.5">
            {tx.productsSummary}
          </Text>
        </View>
      </View>

      <View className="items-end shrink-0">
        <Text className="text-sm font-extrabold text-secondary font-mono">
          {tx.amount}
        </Text>
        <Text className="text-[11px] text-on-surface-variant mt-0.5">
          {tx.statusBadge}
        </Text>
      </View>
    </View>
  );
}
