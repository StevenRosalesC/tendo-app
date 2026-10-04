import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TerminalScreen() {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl items-center">
        <View className="w-full rounded-3xl bg-surface-container-low p-8 border border-surface-container-high shadow-2xl items-center">
          <View className="w-16 h-16 rounded-2xl bg-primary-container items-center justify-center mb-4">
            <MaterialIcons name="point-of-sale" size={32} color="#0d0096" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Terminal de Cobro Rápido
          </Text>
          <Text className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
            Punto de venta activo. Escaneo de códigos de barra, cobro con tarjeta contactless y efectivo.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            className="mt-6 w-full h-12 bg-primary-container rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.99]"
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#0d0096" />
            <Text className="text-sm font-bold text-on-primary-container">
              Escanear Código / Nuevo Ticket
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
