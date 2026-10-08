import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, Text, View } from "react-native";

export interface TerminalShortcutItem {
  key: string;
  label: string;
}

const posShortcuts: TerminalShortcutItem[] = [
  { key: "F2", label: "Buscar Catálogo" },
  { key: "F3", label: "Código de Barras" },
  { key: "F12 / Ctrl+↵", label: "Cobrar Ticket" },
  { key: "Esc", label: "Limpiar" },
];

export default function TerminalShortcutsBar() {
  if (Platform.OS !== "web") return null;

  return (
    <View className="hidden lg:flex py-2 px-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex-row items-center justify-between shadow-xs">
      {/* Station Status */}
      <View className="flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-emerald-400" />
        <MaterialIcons name="point-of-sale" size={16} color="#c0c1ff" />
        <Text className="text-xs font-semibold text-on-surface">
          Mostrador POS
        </Text>
        <Text className="text-xs text-on-surface-variant font-medium">
          • Atajos rápidos de teclado para cajero
        </Text>
      </View>

      {/* Shortcuts List */}
      <View className="flex-row items-center gap-3">
        {posShortcuts.map((item) => (
          <View key={item.key} className="flex-row items-center gap-1.5">
            <View className="px-2 py-0.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 shadow-xs">
              <Text className="text-[11px] font-mono font-bold text-primary">
                {item.key}
              </Text>
            </View>
            <Text className="text-xs text-on-surface-variant font-medium">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
