import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AlertBanner from "../../../components/ui/AlertBanner";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import TendoLogo from "../../../components/ui/TendoLogo";
import TeamManagementTab from "../../../components/settings/TeamManagementTab";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { usePosSocket } from "../../../hooks/usePosSocket";
import tendoApi from "../../../services/api";
import useAuthStore from "../../../stores/useAuthStore";
import usePermissions from "../../../hooks/usePermissions";
import { ProductUnit } from "../../../types/auth.types";

interface UnitOption {
  value: ProductUnit;
  label: string;
  abbreviation: string;
  description: string;
}

const UNIT_OPTIONS: UnitOption[] = [
  {
    value: "UNIT",
    label: "Unidad",
    abbreviation: "u",
    description: "Artículos contables discretos (bebidas, botanas, cajas)",
  },
  {
    value: "KG",
    label: "Kilogramo",
    abbreviation: "kg",
    description: "Venta por peso estándar métrico",
  },
  {
    value: "LB",
    label: "Libra",
    abbreviation: "lb",
    description: "Venta por peso en sistema imperial",
  },
  {
    value: "G",
    label: "Gramo",
    abbreviation: "g",
    description: "Venta de precisión por peso ligero (especias, a granel)",
  },
  {
    value: "L",
    label: "Litro",
    abbreviation: "l",
    description: "Líquidos y bebidas a granel",
  },
  {
    value: "ML",
    label: "Mililitro",
    abbreviation: "ml",
    description: "Líquidos de precisión",
  },
  {
    value: "M",
    label: "Metro",
    abbreviation: "m",
    description: "Venta por longitud (telas, cordeles, cables)",
  },
];

export default function SettingsScreen() {
  const { getToken, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { user, refetch } = useCurrentUser();
  const { canReadUsers, canUpdateStore, role, isManager, isAdmin } = usePermissions();
  const setUser = useAuthStore((s) => s.setUser);
  const { isConnected: isWsConnected } = usePosSocket();

  // Tab state for Admin and Manager
  const [activeTab, setActiveTab] = useState<"store" | "team">("store");

  // Local state for store configuration
  const [storeName, setStoreName] = useState<string>("");
  const [defaultUnit, setDefaultUnit] = useState<ProductUnit>("UNIT");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with loaded user profile store data
  useEffect(() => {
    if (user?.store) {
      setStoreName(user.store.name || "");
      if (user.store.defaultUnit) {
        setDefaultUnit(user.store.defaultUnit);
      }
    }
  }, [user?.store]);

  const handleSaveStoreSettings = async () => {
    if (!storeName.trim()) {
      setErrorMessage("El nombre de la sucursal no puede estar vacío");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No hay sesión activa para autorizar la solicitud");
      }

      const updatedStore = await tendoApi.updateCurrentStore(token, {
        name: storeName.trim(),
        defaultUnit,
      });

      // Update local state in zustand store and react query cache
      if (user) {
        setUser({
          ...user,
          store: {
            ...user.store,
            name: updatedStore.name || storeName.trim(),
            defaultUnit: updatedStore.defaultUnit || defaultUnit,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["stores", "current"] });
      await refetch();

      setSuccessMessage("Configuración de la sucursal actualizada exitosamente");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg =
        err?.message ||
        "No se pudo guardar la configuración de la tienda. Inténtelo de nuevo.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSignOut = () => {
    if (Platform.OS === "web") {
      signOut();
      return;
    }

    Alert.alert(
      "Cerrar sesión de operador",
      "¿Estás seguro de que deseas cerrar la sesión en esta terminal POS?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => signOut(),
        },
      ],
    );
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador General", variant: "primary" as const };
      case "MANAGER":
        return { label: "Gerente de Sucursal", variant: "secondary" as const };
      case "CASHIER":
        return { label: "Cajero Principal", variant: "info" as const };
      default:
        return { label: "Personal Operativo", variant: "neutral" as const };
    }
  };

  const roleInfo = getRoleBadgeVariant(user?.role);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full gap-6 pb-24"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Header section */}
      <View className="flex-row items-center justify-between flex-wrap gap-3 pb-2 border-b border-surface-container-high/40">
        <View className="gap-1">
          <View className="flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center">
              <MaterialIcons name="settings" size={22} color="#c0c1ff" />
            </View>
            <View>
              <Text className="text-xl sm:text-2xl font-bold text-on-surface">
                Ajustes de Terminal y Sucursal
              </Text>
              <Text className="text-xs sm:text-sm text-on-surface-variant">
                Parámetros operativos de la tienda, catálogo y sesión de operador
              </Text>
            </View>
          </View>
        </View>

        <Badge
          label={roleInfo.label}
          variant={roleInfo.variant}
          dot
          className="self-start sm:self-center"
        />
      </View>

      {/* Segmented Tab Bar for Store & Team Management (Admin/Manager) */}
      {canReadUsers && (
        <View className="flex-row p-1 bg-surface-container-low border border-surface-container-high rounded-2xl">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab("store")}
            className={`flex-1 py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
              activeTab === "store"
                ? "bg-surface-container-highest"
                : "bg-transparent"
            }`}
          >
            <MaterialIcons
              name="storefront"
              size={18}
              color={activeTab === "store" ? "#c0c1ff" : "#c7c4d7"}
            />
            <Text
              className={`text-xs sm:text-sm font-bold ${
                activeTab === "store" ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              Tienda y Terminal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab("team")}
            className={`flex-1 py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 ${
              activeTab === "team"
                ? "bg-surface-container-highest"
                : "bg-transparent"
            }`}
          >
            <MaterialIcons
              name="groups"
              size={18}
              color={activeTab === "team" ? "#c0c1ff" : "#c7c4d7"}
            />
            <Text
              className={`text-xs sm:text-sm font-bold ${
                activeTab === "team" ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              Equipo y Cajeros
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "team" && canReadUsers ? (
        <TeamManagementTab />
      ) : (
        <>
          {/* Status banners */}
      {successMessage && (
        <AlertBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} />
      )}

      {/* Read-only notification if not manager/admin */}
      {!canUpdateStore && (
        <AlertBanner
          type="info"
          message="Modo lectura: Solo los usuarios con rol Administrador pueden modificar el nombre y la unidad por defecto de la sucursal."
        />
      )}

      {/* Block 1: Store & Catalog Configuration */}
      <Card variant="default" className="gap-5">
        <View className="flex-row items-center justify-between pb-3 border-b border-surface-container-high/40">
          <View className="flex-row items-center gap-2.5">
            <MaterialIcons name="storefront" size={20} color="#c0c1ff" />
            <Text className="text-base font-bold text-on-surface">
              Configuración de la Sucursal
            </Text>
          </View>
          {canUpdateStore ? (
            <Badge label="Edición Habilitada" variant="success" size="sm" />
          ) : (
            <Badge label="Solo Lectura" variant="neutral" size="sm" />
          )}
        </View>

        {/* Store Name Input */}
        <View className="gap-1.5">
          <Input
            label="Nombre Comercial de la Sucursal"
            placeholder="Ej. Tendo Central Condesa"
            value={storeName}
            onChangeText={canUpdateStore ? setStoreName : undefined}
            editable={canUpdateStore && !isSaving}
            iconName="business"
            helperText="Aparecerá en los encabezados del POS, tickets y reportes de corte"
          />
        </View>

        {/* Default Unit Selection */}
        <View className="gap-2.5">
          <View className="gap-1">
            <Text className="text-xs font-medium text-on-surface">
              Unidad de Medida Predeterminada
            </Text>
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Esta unidad se asignará automáticamente al dar de alta nuevos productos en el catálogo si no se elige otra.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2.5 pt-1">
            {UNIT_OPTIONS.map((opt) => {
              const isSelected = defaultUnit === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.75}
                  disabled={!canUpdateStore}
                  onPress={() => setDefaultUnit(opt.value)}
                  className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl border ${
                    isSelected
                      ? "bg-primary/15 border-primary"
                      : "bg-surface-container-highest/70 border-surface-container-high"
                  } ${!canUpdateStore ? "opacity-60" : ""}`}
                >
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center font-bold text-xs ${
                      isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        isSelected ? "text-slate-900" : "text-on-surface-variant"
                      }`}
                    >
                      {opt.abbreviation.toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-primary font-bold" : "text-on-surface"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </View>

                  {isSelected && (
                    <MaterialIcons name="check" size={16} color="#c0c1ff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save button (Admin only per stores:update) */}
        {canUpdateStore && (
          <View className="pt-2 flex-row justify-end">
            <Button
              label={isSaving ? "Guardando cambios..." : "Guardar configuración"}
              loading={isSaving}
              leftIcon={<MaterialIcons name="save" size={18} color="#1e1f4b" />}
              variant="primary"
              disabled={isSaving}
              onPress={handleSaveStoreSettings}
              className="px-6"
            />
          </View>
        )}
      </Card>

      {/* Block 2: Operator Profile & Session Details */}
      <Card variant="low" className="gap-4">
        <View className="flex-row items-center gap-2.5 pb-3 border-b border-surface-container-high/40">
          <MaterialIcons name="account-circle" size={20} color="#c7c4d7" />
          <Text className="text-base font-bold text-on-surface">
            Operador y Sesión Activa
          </Text>
        </View>

        <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <View className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high/40 gap-1">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Nombre de Operador
            </Text>
            <Text className="text-sm font-semibold text-on-surface">
              {user?.name || "Sin nombre registrado"}
            </Text>
            <Text className="text-xs text-on-surface-variant">
              {user?.email || "Sin correo"}
            </Text>
          </View>

          <View className="p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high/40 gap-1">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Rol en el Sistema
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Badge label={roleInfo.label} variant={roleInfo.variant} dot />
            </View>
            <Text className="text-[11px] text-on-surface-variant mt-1">
              {isManager
                ? "Permisos completos de administración y supervisión"
                : "Permisos de cobro en terminal y lectura"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Block 3: Terminal Hardware & Connection Status */}
      <Card variant="low" className="gap-4">
        <View className="flex-row items-center gap-2.5 pb-3 border-b border-surface-container-high/40">
          <TendoLogo variant="emblem" size={20} color="#017AF6" />
          <Text className="text-base font-bold text-on-surface">
            Estado de Terminal POS
          </Text>
        </View>

        <View className="flex-row items-center justify-between p-3.5 rounded-xl bg-surface-container/60 border border-surface-container-high/40">
          <View className="flex-row items-center gap-3">
            <View
              className={`w-3 h-3 rounded-full ${
                isWsConnected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <View>
              <Text className="text-sm font-semibold text-on-surface">
                Sincronización en Tiempo Real
              </Text>
              <Text className="text-xs text-on-surface-variant">
                {isWsConnected
                  ? "Terminal conectada y sincronizada"
                  : "Sin conexión - Intentando reconectar..."}
              </Text>
            </View>
          </View>
          <Badge
            label={isWsConnected ? "En Línea" : "Sin Conexión"}
            variant={isWsConnected ? "success" : "danger"}
            size="sm"
          />
        </View>
      </Card>

          {/* Block 4: Sign Out / Security */}
          <View className="pt-2">
            <Button
              label="Cerrar sesión de operador"
              variant="danger"
              fullWidth
              leftIcon={<MaterialIcons name="logout" size={18} color="#FFDAD6" />}
              onPress={confirmSignOut}
            />
          </View>

          {/* Branding Footer */}
          <View className="items-center justify-center pt-8 pb-4 gap-1.5 opacity-60">
            <TendoLogo variant="horizontal" size={20} wordmarkColor="#908fa0" />
            <Text className="text-[11px] text-outline-variant font-medium">
              Tendo POS Platform • Versión 1.0.0
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
