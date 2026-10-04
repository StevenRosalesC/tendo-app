import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export interface ShortcutItem {
  key: string;
  label: string;
}

const defaultShortcuts: ShortcutItem[] = [
  { key: "F3", label: "Nuevo Producto" },
  { key: "F4", label: "Buscar / Escanear" },
  { key: "Espacio", label: "Seleccionar fila" },
  { key: "E", label: "Editar" },
  { key: "Esc", label: "Limpiar filtros" },
];

export default function InventoryShortcutsBar() {
  return (
    <View className="py-2.5 px-4 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row flex-wrap items-center justify-between gap-3 shadow-xs">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="keyboard" size={18} color="#c0c1ff" />
        <Text className="text-xs font-semibold text-on-surface">
          Atajos de Teclado del Mostrador:
        </Text>
      </View>

      <View className="flex-row items-center gap-4 flex-wrap">
        {defaultShortcuts.map((item) => (
          <View key={item.key} className="flex-row items-center gap-1.5">
            <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60 shadow-xs">
              <Text className="text-[11px] font-mono font-bold text-on-surface">
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
