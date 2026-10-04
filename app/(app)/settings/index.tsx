import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../../components/Navigation";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ScrollView
        contentContainerClassName="flex-grow p-6 items-center justify-between"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-lg items-center">
          <View className="w-full rounded-3xl bg-surface-card p-8 border border-surface-border shadow-2xl items-center">
            <View className="w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-border items-center justify-center mb-4">
              <MaterialIcons name="settings" size={32} color="#c0c1ff" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Configuración de Terminal
            </Text>
            <Text className="text-sm text-zinc-400 mt-2 text-center">
              Ajustes de terminal POS, periféricos de impresión y credenciales de nodo.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => signOut()}
              className="mt-8 w-full py-3.5 rounded-xl bg-surface-elevated border border-surface-border items-center active:bg-zinc-800"
            >
              <Text className="text-sm font-bold text-status-danger">
                Cerrar sesión de operador
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
