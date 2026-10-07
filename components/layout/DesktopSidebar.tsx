import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface SidebarLink {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  active: boolean;
}

export interface DesktopSidebarProps {
  currentPath: string;
  operatorName: string;
  operatorInitial: string;
  roleName?: string;
  storeName?: string;
  isHardwareConnected?: boolean;
  onNavigate: (route: string) => void;
  onSignOut: () => void;
}

export default function DesktopSidebar({
  currentPath,
  operatorName,
  operatorInitial,
  roleName = "ADMIN",
  storeName = "Tienda Principal",
  isHardwareConnected = true,
  onNavigate,
  onSignOut,
}: DesktopSidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const sidebarLinks: SidebarLink[] = [
    {
      label: "Inicio Hub",
      icon: "dashboard",
      route: "/home",
      active: currentPath === "/home" || currentPath === "/",
    },
    {
      label: "Terminal POS",
      icon: "point-of-sale",
      route: "/terminal",
      active: currentPath === "/terminal",
    },
    {
      label: "Catálogo / Inventario",
      icon: "inventory-2",
      route: "/inventory",
      active: currentPath === "/inventory",
    },
    {
      label: "Reportes y Ventas",
      icon: "insights",
      route: "/reports",
      active: currentPath === "/reports",
    },
    {
      label: "Ajustes de Tienda",
      icon: "settings",
      route: "/settings",
      active: currentPath === "/settings",
    },
  ];

  return (
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
              onPress={() => onNavigate(link.route)}
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
            <View
              className={`w-2 h-2 rounded-full ${
                isHardwareConnected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <Text className="text-xs text-on-surface-variant font-medium">
              Servidor POS
            </Text>
          </View>
          <Text className="text-xs text-on-surface font-semibold">
            {isHardwareConnected ? "Conectado" : "Desconectado"}
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
                {roleName} • {storeName}
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
                  onSignOut();
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
  );
}
