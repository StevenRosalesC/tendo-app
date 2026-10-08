import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import usePermissions from "../hooks/usePermissions";
import { AppAction, AppResource } from "../types/permissions.types";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { can } = usePermissions();

  const allNavItems = [
    {
      label: "Hub",
      icon: "dashboard" as const,
      route: "/home",
      visible: true,
    },
    {
      label: "Terminal",
      icon: "point-of-sale" as const,
      route: "/terminal",
      visible:
        can(AppResource.SALES, AppAction.CREATE) ||
        can(AppResource.SALES, AppAction.READ),
    },
    {
      label: "Stock",
      icon: "inventory-2" as const,
      route: "/inventory",
      visible: can(AppResource.PRODUCTS, AppAction.READ),
    },
    {
      label: "Reportes",
      icon: "insights" as const,
      route: "/reports",
      visible: can(AppResource.REPORTS, AppAction.READ),
    },
    {
      label: "Ajustes",
      icon: "settings" as const,
      route: "/settings",
      visible: can(AppResource.STORES, AppAction.READ),
    },
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  return (
    <View className="w-full bg-surface-container-lowest/95 border-t border-surface-container-high/60 px-2 py-1 shadow-2xl">
      <View className="flex-row justify-around items-center max-w-lg mx-auto w-full">
        {navItems.map((item) => {
          const isActive =
            pathname === item.route ||
            (item.route === "/home" && (pathname === "/" || pathname === "/home"));

          return (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.7}
              onPress={() => {
                if (!isActive) {
                  router.replace(item.route as any);
                }
              }}
              className="flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 px-2 py-1 rounded-xl"
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={isActive ? "#c0c1ff" : "#c7c4d7"}
              />
              <Text
                className={`text-[11px] ${
                  isActive ? "text-primary font-bold" : "text-on-surface-variant font-medium"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
