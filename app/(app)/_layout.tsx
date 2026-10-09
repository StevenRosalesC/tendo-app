import { useAuth, useUser } from "@clerk/expo";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DesktopHeader from "../../components/layout/DesktopHeader";
import DesktopSidebar from "../../components/layout/DesktopSidebar";
import MobileHeader from "../../components/layout/MobileHeader";
import Navigation from "../../components/Navigation";
import OrderDrawer from "../../components/orders/OrderDrawer";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useKeyboard } from "../../hooks/useKeyboard";
import { usePosSocket } from "../../hooks/usePosSocket";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const { user: userProfile } = useCurrentUser();
  const { isConnected: isWsConnected } = usePosSocket();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Initialize push notifications lifecycle and listeners
  usePushNotifications();

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-surface items-center justify-center min-h-screen">
        <ActivityIndicator color="#c0c1ff" size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  const operatorName = userProfile?.name || user?.fullName || "Operador POS";
  const firstName =
    userProfile?.name?.split(" ")[0] || user?.firstName || "Operador";
  const operatorInitial = firstName.charAt(0).toUpperCase();
  const storeName = userProfile?.store?.name || "Sucursal Principal";
  const roleName = userProfile?.role || "ADMIN";

  // Dynamic titles based on active route
  const getPageInfo = () => {
    if (pathname.includes("/terminal")) {
      return { desktop: "Terminal POS", mobile: "Terminal POS" };
    }
    if (pathname.includes("/inventory")) {
      return { desktop: "Catálogo / Inventario", mobile: "Inventario" };
    }
    if (pathname.includes("/reports")) {
      return { desktop: "Reportes y Métricas", mobile: "Reportes" };
    }
    if (pathname.includes("/settings")) {
      return { desktop: "Ajustes de Terminal", mobile: "Ajustes" };
    }
    return { desktop: "Dashboard Hub", mobile: "Inicio Hub" };
  };

  const pageInfo = getPageInfo();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface">
      <StatusBar style="light" />
      <View className="flex-1 flex-row">
        {/* 1. Desktop Persistent Left Sidebar */}
        <DesktopSidebar
          currentPath={pathname}
          operatorName={operatorName}
          operatorInitial={operatorInitial}
          roleName={roleName}
          storeName={storeName}
          isHardwareConnected={isWsConnected}
          onNavigate={(route) => router.replace(route as any)}
          onSignOut={() => signOut()}
        />

        {/* 2. Main Content View Area */}
        <View className="flex-1 flex-col min-w-0 bg-surface">
          {/* Top Header: Desktop variant */}
          <DesktopHeader
            pageTitle={pageInfo.desktop}
            operatorInitial={operatorInitial}
            stationName={roleName}
            branchName={storeName}
            isOnline={isWsConnected}
            onLock={() => signOut()}
          />

          {/* Top Header: Mobile variant */}
          <MobileHeader
            pageTitle={pageInfo.mobile}
            operatorInitial={operatorInitial}
            stationName={storeName}
            shiftStatus={roleName}
            isOnline={isWsConnected}
          />

          {/* 3. Active Screen Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 min-w-0"
            style={
              Platform.OS === "android" && isKeyboardVisible
                ? { paddingBottom: keyboardHeight }
                : undefined
            }
          >
            <Slot />
          </KeyboardAvoidingView>

          {/* 4. Mobile Bottom Navigation (Hidden when keyboard is open to maximize workspace) */}
          {!isKeyboardVisible && (
            <View className="flex md:hidden">
              <Navigation />
            </View>
          )}
        </View>
      </View>

      {/* 5. Global Left-to-Right Order Drawer */}
      <OrderDrawer />
    </SafeAreaView>
  );
}
