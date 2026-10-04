import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

export default function ReportsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl items-center">
        <View className="w-full rounded-3xl bg-surface-container-low p-8 border border-surface-container-high shadow-2xl items-center">
          <View className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-surface-container-high items-center justify-center mb-4">
            <MaterialIcons name="insights" size={32} color="#c0c1ff" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Reportes y Arqueo de Caja
          </Text>
          <Text className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
            Arqueo de caja rápido, desglose consolidado por métodos de pago y emisión de corte Z del turno.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
