import { useAuth, useUser } from "@clerk/expo";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DesktopHeader from "../../components/layout/DesktopHeader";
import DesktopSidebar from "../../components/layout/DesktopSidebar";
import MobileHeader from "../../components/layout/MobileHeader";
import Navigation from "../../components/Navigation";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePosSocket } from "../../hooks/usePosSocket";

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const { user: userProfile } = useCurrentUser();
  const { isConnected: isWsConnected } = usePosSocket();

  const [sessionTime, setSessionTime] = useState<string>("04:22:18");

  // Live timer for shift telemetry
  useEffect(() => {
    let seconds = 4 * 3600 + 22 * 60 + 18;
    const interval = setInterval(() => {
      seconds += 1;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setSessionTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const operatorName = userProfile?.name || user?.fullName || "Carlos Mendoza";
  const firstName =
    userProfile?.name?.split(" ")[0] || user?.firstName || "Carlos";
  const operatorInitial = firstName.charAt(0).toUpperCase();
  const storeName = userProfile?.store?.name || "Sucursal Condesa";
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
          isHardwareConnected={true}
          onNavigate={(route) => router.replace(route as any)}
          onSignOut={() => signOut()}
        />

        {/* 2. Main Content View Area */}
        <View className="flex-1 flex-col min-w-0 bg-surface">
          {/* Top Header: Desktop variant */}
          <DesktopHeader
            pageTitle={pageInfo.desktop}
            sessionTime={sessionTime}
            operatorInitial={operatorInitial}
            stationName="Caja #01"
            branchName={storeName}
            isOnline={isWsConnected}
            onLock={() => signOut()}
            onSync={() => {}}
          />

          {/* Top Header: Mobile variant */}
          <MobileHeader
            pageTitle={pageInfo.mobile}
            operatorInitial={operatorInitial}
            stationName="Caja #01"
            isOnline={isWsConnected}
          />

          {/* 3. Active Screen Content */}
          <View className="flex-1 min-w-0">
            <Slot />
          </View>

          {/* 4. Mobile Bottom Navigation */}
          <View className="flex md:hidden">
            <Navigation />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
