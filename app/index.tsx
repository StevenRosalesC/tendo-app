import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import TendoLogo from "../components/ui/TendoLogo";

export default function RootIndex() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-surface-base items-center justify-center gap-6">
        <TendoLogo variant="full" size={96} color="#017AF6" wordmarkColor="#FFFFFF" />
        <ActivityIndicator size="small" color="#017AF6" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}

