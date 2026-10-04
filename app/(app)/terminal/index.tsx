import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../../components/Navigation";

export default function TerminalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ScrollView
        contentContainerClassName="flex-grow p-6 items-center justify-between"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-lg items-center">
          <View className="w-full rounded-3xl bg-surface-card p-8 border border-surface-border shadow-2xl items-center">
            <View className="w-16 h-16 rounded-2xl bg-primary-container items-center justify-center mb-4">
              <MaterialIcons name="point-of-sale" size={32} color="#0d0096" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Terminal de Cobro Rápido
            </Text>
            <Text className="text-sm text-zinc-400 mt-2 text-center">
              Punto de venta activo. Escaneo de códigos de barra, cobro con tarjeta contactless y efectivo.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              className="mt-6 w-full h-12 bg-primary-container rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary-container/20"
            >
              <MaterialIcons name="qr-code-scanner" size={20} color="#0d0096" />
              <Text className="text-sm font-bold text-on-primary-container">
                Escanear Código / Nuevo Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-full items-center mt-6">
          <Navigation />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
