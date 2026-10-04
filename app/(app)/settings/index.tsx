import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl items-center">
        <View className="w-full rounded-3xl bg-surface-container-low p-8 border border-surface-container-high shadow-2xl items-center">
          <View className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-surface-container-high items-center justify-center mb-4">
            <MaterialIcons name="settings" size={32} color="#c0c1ff" />
          </View>
          <Text className="text-2xl font-bold text-on-surface text-center">
            Configuración de Terminal POS
          </Text>
          <Text className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
            Ajustes de estación, periféricos de impresión térmica, configuración de nodo y credenciales.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => signOut()}
            className="mt-8 w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 items-center"
          >
            <Text className="text-sm font-bold text-status-danger">
              Cerrar sesión de operador
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
