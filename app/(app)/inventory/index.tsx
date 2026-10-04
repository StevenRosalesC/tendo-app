import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function InventoryScreen() {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl items-center">
        <View className="w-full rounded-3xl bg-surface-container-low p-8 border border-surface-container-high shadow-2xl items-center">
          <View className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-surface-container-high items-center justify-center mb-4">
            <MaterialIcons name="inventory" size={32} color="#c0c1ff" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Catálogo & Inventario de Tienda
          </Text>
          <Text className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
            Consulta de catálogo comercial, existencias en tiempo real, alertas de stock mínimo y precios sincronizados.
          </Text>

          <View className="w-full mt-6 p-4 rounded-2xl bg-surface-container border border-surface-container-high items-center">
            <Text className="text-xs text-on-surface-variant font-medium">
              145 artículos activos en catálogo
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
