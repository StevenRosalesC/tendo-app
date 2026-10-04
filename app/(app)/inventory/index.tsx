import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../../components/Navigation";

export default function InventoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ScrollView
        contentContainerClassName="flex-grow p-6 items-center justify-between"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-lg items-center">
          <View className="w-full rounded-3xl bg-surface-card p-8 border border-surface-border shadow-2xl items-center">
            <View className="w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-border items-center justify-center mb-4">
              <MaterialIcons name="inventory" size={32} color="#c0c1ff" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Inventario de Tienda
            </Text>
            <Text className="text-sm text-zinc-400 mt-2 text-center">
              Consulta de catálogo, stock en tiempo real y precios sincronizados con la nube.
            </Text>

            <View className="w-full mt-6 p-4 rounded-2xl bg-surface-elevated border border-surface-border items-center">
              <Text className="text-xs text-on-surface-variant font-medium">
                Módulo en desarrollo • Catálogo Omnicanal
              </Text>
            </View>
          </View>
        </View>

        <View className="w-full items-center mt-6">
          <Navigation />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
