import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../../components/Navigation";

export default function ReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ScrollView
        contentContainerClassName="flex-grow p-6 items-center justify-between"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-lg items-center">
          <View className="w-full rounded-3xl bg-surface-card p-8 border border-surface-border shadow-2xl items-center">
            <View className="w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-border items-center justify-center mb-4">
              <MaterialIcons name="insights" size={32} color="#c0c1ff" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Reportes y Métricas
            </Text>
            <Text className="text-sm text-zinc-400 mt-2 text-center">
              Arqueo de caja, desglose por métodos de pago y corte Z del turno.
            </Text>
          </View>
        </View>

        <View className="w-full items-center mt-6">
          <Navigation />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
