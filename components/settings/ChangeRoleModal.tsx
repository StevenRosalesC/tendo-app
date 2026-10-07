import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

import AlertBanner from "../ui/AlertBanner";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import tendoApi from "../../services/api";
import { AppRole, UserListItem } from "../../types/auth.types";

interface ChangeRoleModalProps {
  visible: boolean;
  onClose: () => void;
  member: UserListItem | null;
  onSuccess: () => void;
}

interface RoleOption {
  role: AppRole;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  variant: "primary" | "info" | "success" | "neutral";
  colorClass: string;
  badgeLabel: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "CASHIER",
    title: "Cajero POS",
    description: "Operación de caja, cobro a clientes, escaneo de productos y arqueo.",
    icon: "point-of-sale",
    variant: "success",
    colorClass: "border-emerald-500/40 bg-emerald-500/10",
    badgeLabel: "CAJERO",
  },
  {
    role: "MANAGER",
    title: "Encargado / Gerente",
    description: "Gestión de catálogo, ajustes de inventario y supervisión operativa.",
    icon: "manage-accounts",
    variant: "info",
    colorClass: "border-cyan-500/40 bg-cyan-500/10",
    badgeLabel: "GERENTE",
  },
  {
    role: "STAFF",
    title: "Personal (Staff)",
    description: "Operador de piso/comandas. Sin acceso a reportes contables ni ajustes.",
    icon: "badge",
    variant: "neutral",
    colorClass: "border-surface-container-high bg-surface-container-high/30",
    badgeLabel: "PERSONAL",
  },
  {
    role: "ADMIN",
    title: "Administrador / Dueño",
    description: "Control absoluto sobre la tienda, finanzas y asignación de equipo.",
    icon: "security",
    variant: "primary",
    colorClass: "border-primary/40 bg-primary/10",
    badgeLabel: "ADMIN",
  },
];

export default function ChangeRoleModal({
  visible,
  onClose,
  member,
  onSuccess,
}: ChangeRoleModalProps) {
  const { getToken } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole>("STAFF");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
      setErrorMessage(null);
    }
  }, [member]);

  if (!member) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleSaveRole = async () => {
    if (selectedRole === member.role) {
      handleClose();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const token = await getToken();
      if (!token) throw new Error("No se pudo obtener el token de autenticación.");

      await tendoApi.updateUserRole(token, member.id, selectedRole);

      const msg = `Se actualizó el rol de ${member.name} a ${selectedRole}.`;
      if (Platform.OS === "web") {
        // Subtle or silent update for web
      } else {
        Alert.alert("Rol Actualizado", msg);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating user role:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al intentar cambiar el rol del empleado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Asignar Rol de Puesto"
      subtitle={`Configura las responsabilidades de ${member.name}`}
      icon="admin-panel-settings"
      maxWidth="md"
    >
      <View className="gap-4">
        {errorMessage && (
          <AlertBanner
            type="error"
            message={errorMessage}
          />
        )}

        {/* Member profile summary pill */}
        <View className="bg-surface-container-high/40 border border-surface-container-high rounded-2xl p-3 flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-semibold text-on-surface" numberOfLines={1}>
              {member.name}
            </Text>
            <Text className="text-xs text-on-surface-variant" numberOfLines={1}>
              {member.email}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs text-on-surface-variant">Actual:</Text>
            <Badge label={member.role} variant="neutral" size="sm" />
          </View>
        </View>

        {/* Role options selectable cards */}
        <View className="gap-2.5">
          {ROLE_OPTIONS.map((item) => {
            const isSelected = selectedRole === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                activeOpacity={0.7}
                onPress={() => setSelectedRole(item.role)}
                disabled={isSubmitting}
                className={`p-3.5 rounded-2xl border transition-all flex-row items-center gap-3.5 ${
                  isSelected
                    ? `${item.colorClass} border-2`
                    : "bg-surface-container-low border-surface-container-high/60 hover:bg-surface-container"
                }`}
              >
                {/* Radio indicator */}
                <View
                  className={`w-5 h-5 rounded-full items-center justify-center border ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-on-surface-variant/40 bg-surface-container-highest"
                  }`}
                >
                  {isSelected && (
                    <View className="w-2 h-2 rounded-full bg-on-primary" />
                  )}
                </View>

                {/* Role Details */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-0.5">
                    <MaterialIcons
                      name={item.icon}
                      size={18}
                      color={isSelected ? "#c0c1ff" : "#c7c4d7"}
                    />
                    <Text className="text-sm font-bold text-on-surface">
                      {item.title}
                    </Text>
                    <Badge label={item.badgeLabel} variant={item.variant} size="sm" />
                  </View>
                  <Text className="text-xs text-on-surface-variant leading-tight">
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-end gap-3 pt-3">
          <Button
            label="Cancelar"
            variant="ghost"
            onPress={handleClose}
            disabled={isSubmitting}
          />
          <Button
            label={isSubmitting ? "Guardando..." : "Guardar Cambios"}
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || selectedRole === member.role}
            onPress={handleSaveRole}
            leftIcon={
              !isSubmitting ? (
                <MaterialIcons name="check" size={18} color="#0d0096" />
              ) : undefined
            }
          />
        </View>
      </View>
    </Modal>
  );
}
