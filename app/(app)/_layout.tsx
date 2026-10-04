import { useAuth, useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../components/Navigation";

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  const [sessionTime, setSessionTime] = useState<string>("04:22:18");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

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

  const operatorName = user?.fullName || "Carlos Mendoza";
  const firstName = user?.firstName || "Carlos";
  const operatorInitial = firstName.charAt(0).toUpperCase();

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

  const sidebarLinks = [
    {
      label: "Dashboard Hub",
      icon: "grid-view" as const,
      route: "/home",
      active: pathname === "/home" || pathname === "/",
    },
    {
      label: "Terminal POS",
      icon: "desktop-windows" as const,
      route: "/terminal",
      active: pathname === "/terminal",
    },
    {
      label: "Catálogo / Inventario",
      icon: "inventory-2" as const,
      route: "/inventory",
      active: pathname === "/inventory",
    },
    {
      label: "Movimientos y Caja",
      icon: "payments" as const,
      route: "/reports",
      active: false,
    },
    {
      label: "Reportes",
      icon: "insights" as const,
      route: "/reports",
      active: pathname === "/reports",
    },
    {
      label: "Ajustes",
      icon: "tune" as const,
      route: "/settings",
      active: pathname === "/settings",
    },
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface">
      <StatusBar style="light" />
      <View className="flex-1 flex-row">
        {/* 1. Desktop Persistent Left Sidebar (hidden on mobile, visible on md/lg) */}
        <View className="w-72 bg-surface-container-low border-r border-surface-container-high/60 flex-col justify-between hidden md:flex shrink-0">
          <View className="flex-col">
            {/* Logo Brand Header */}
            <View className="h-16 px-6 flex-row items-center gap-3 bg-surface-container-low border-b border-surface-container-high/40">
              <View className="w-9 h-9 rounded-lg bg-primary-container items-center justify-center">
                <MaterialIcons name="point-of-sale" size={22} color="#0d0096" />
              </View>
              <View className="flex-col">
                <Text className="text-base font-extrabold text-on-surface tracking-tight leading-none">
                  Tendo
                </Text>
                <Text className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase leading-none mt-1">
                  Omnichannel POS
                </Text>
              </View>
            </View>

            {/* Desktop Navigation Links */}
            <View className="px-3 py-4 gap-1">
              {sidebarLinks.map((link) => (
                <TouchableOpacity
                  key={link.label}
                  activeOpacity={0.7}
                  onPress={() => router.replace(link.route as any)}
                  className={`flex-row items-center gap-3 px-4 py-2.5 rounded-xl ${
                    link.active
                      ? "bg-surface-container-high border border-surface-container-highest/60"
                      : "hover:bg-surface-container"
                  }`}
                >
                  <MaterialIcons
                    name={link.icon}
                    size={20}
                    color={link.active ? "#c0c1ff" : "#c7c4d7"}
                  />
                  <Text
                    className={`text-sm ${
                      link.active
                        ? "text-on-surface font-bold"
                        : "text-on-surface-variant font-medium hover:text-on-surface"
                    }`}
                  >
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sidebar Footer: Hardware Status & Operator Profile */}
          <View className="p-4 bg-surface-container-lowest border-t border-surface-container-high/40 gap-3">
            <View className="flex-row items-center justify-between px-3 py-1.5 bg-surface-container-low rounded-lg border border-surface-container-high/40">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-xs text-on-surface-variant font-medium">
                  Hardware Terminal
                </Text>
              </View>
              <Text className="text-xs text-on-surface font-semibold">
                OK (3 disp.)
              </Text>
            </View>

            {/* User Profile Card */}
            <View className="relative">
              <View className="flex-row items-center gap-3 p-2 bg-surface-container rounded-xl border border-surface-container-high/60">
                <View className="w-9 h-9 rounded-full bg-secondary-container items-center justify-center shrink-0">
                  <Text className="text-xs font-bold text-on-secondary-container">
                    {operatorInitial}
                  </Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xs font-bold text-on-surface truncate">
                    {operatorName}
                  </Text>
                  <Text className="text-[10px] text-on-surface-variant truncate">
                    Cajero • Caja Principal 01
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 hover:bg-surface-container-high rounded-lg"
                >
                  <MaterialIcons name="more-vert" size={18} color="#c7c4d7" />
                </TouchableOpacity>
              </View>

              {/* Logout Dropdown Popover */}
              {showUserMenu && (
                <View className="absolute bottom-16 right-0 w-48 bg-surface-container-high border border-surface-container-highest rounded-xl p-1.5 shadow-2xl z-50">
                  <TouchableOpacity
                    onPress={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-status-danger/20"
                  >
                    <MaterialIcons name="lock" size={16} color="#EF4444" />
                    <Text className="text-xs font-bold text-status-danger">
                      Cerrar sesión de caja
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 2. Main Content View Area (Responsive Frame) */}
        <View className="flex-1 flex-col min-w-0 bg-surface">
          {/* Top Header: Desktop variant */}
          <View className="h-16 bg-surface-container/90 border-b border-surface-container-high/60 px-6 hidden md:flex flex-row items-center justify-between z-40 backdrop-blur-md">
            <View className="flex-row items-center gap-4 min-w-0">
              <View className="flex-row items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                <Text className="text-xs text-on-surface-variant font-medium">
                  Tendo POS
                </Text>
                <MaterialIcons name="chevron-right" size={14} color="#908fa0" />
                <Text className="text-xs text-on-surface font-bold">
                  {pageInfo.desktop}
                </Text>
              </View>

              <View className="h-4 w-[1px] bg-surface-container-highest" />

              <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high">
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-xs font-semibold text-on-surface">
                  En línea
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="hidden lg:flex flex-row items-center gap-2 px-3 py-1 bg-surface-container-high rounded-lg text-xs border border-surface-container-highest/60">
                <MaterialIcons name="store" size={15} color="#c0c1ff" />
                <Text className="text-xs text-on-surface font-semibold">
                  Caja #04
                </Text>
                <Text className="text-xs text-outline-variant">•</Text>
                <Text className="text-xs text-on-surface-variant">
                  Sucursal Condesa
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-lg border border-surface-container-highest/60">
                <MaterialIcons name="timer" size={15} color="#c3c0ff" />
                <Text className="text-xs font-mono font-bold text-on-surface">
                  {sessionTime}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => signOut()}
                className="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest rounded-lg flex-row items-center gap-1.5 border border-surface-container-highest/60"
              >
                <MaterialIcons name="lock" size={16} color="#c7c4d7" />
                <Text className="text-xs font-medium text-on-surface hidden xl:inline">
                  Bloquear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                className="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest rounded-lg flex-row items-center gap-1.5 border border-surface-container-highest/60"
              >
                <MaterialIcons name="sync" size={16} color="#c7c4d7" />
                <Text className="text-xs font-medium text-on-surface hidden xl:inline">
                  Sincronizar
                </Text>
              </TouchableOpacity>

              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center ml-1 shadow-sm">
                <Text className="text-xs font-bold text-on-primary">
                  {operatorInitial}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Header: Mobile variant */}
          <View className="w-full bg-surface-container-lowest/80 border-b border-surface-container-high/40 px-4 py-3 flex md:hidden">
            <View className="w-full flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-cyan-400" />
                  <Text className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    WS Live
                  </Text>
                </View>
                <Text className="text-outline-variant font-medium">/</Text>
                <Text className="text-base font-bold text-on-surface">
                  {pageInfo.mobile}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="items-end">
                  <Text className="text-xs font-bold text-on-surface leading-tight">
                    Caja #04
                  </Text>
                  <Text className="text-[10px] text-on-surface-variant font-medium leading-tight">
                    Turno Activo
                  </Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-sm">
                  <Text className="text-xs font-bold text-on-primary">
                    {operatorInitial}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. Slot: Content of the active screen */}
          <View className="flex-1 min-w-0">
            <Slot />
          </View>

          {/* 4. Mobile Bottom Navigation (shown on screens < md, hidden on md/lg) */}
          <View className="flex md:hidden">
            <Navigation />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
