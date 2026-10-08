import { useAuth, useOrganization } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import ChangeRoleModal from "./ChangeRoleModal";
import InviteMemberModal from "./InviteMemberModal";
import AlertBanner from "../ui/AlertBanner";
import Badge, { BadgeVariant } from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import tendoApi from "../../services/api";
import useAuthStore from "../../stores/useAuthStore";
import usePermissions from "../../hooks/usePermissions";
import { AppRole, UserListItem } from "../../types/auth.types";

const ROLE_BADGE_CONFIG: Record<
  AppRole,
  { label: string; variant: BadgeVariant; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  ADMIN: { label: "Admin / Dueño", variant: "primary", icon: "security" },
  MANAGER: { label: "Gerente", variant: "info", icon: "manage-accounts" },
  CASHIER: { label: "Cajero", variant: "success", icon: "point-of-sale" },
  STAFF: { label: "Personal", variant: "neutral", icon: "badge" },
};

export default function TeamManagementTab() {
  const { getToken } = useAuth();
  const { user: currentUser } = useCurrentUser();
  const { canCreateUsers, canUpdateUsers, canDeleteUsers, isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 1024;

  // Clerk Organization for pending invitations
  const { organization, invitations, isLoaded: isOrgLoaded } = useOrganization({
    invitations: {
      status: ["pending"],
    },
  });

  // Local state
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"ALL" | AppRole>("ALL");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToEditRole, setMemberToEditRole] = useState<UserListItem | null>(null);
  const [showPendingSection, setShowPendingSection] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  // Fetch team members from Tendo Backend
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["users", selectedRoleFilter, search],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No se pudo obtener el token");
      return tendoApi.getUsers(token, {
        page: 1,
        limit: 50,
        role: selectedRoleFilter === "ALL" ? undefined : selectedRoleFilter,
        search: search.trim() ? search.trim() : undefined,
      });
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const members: UserListItem[] = useMemo(() => {
    return usersData?.data || [];
  }, [usersData]);

  // Pending invitations list from Clerk
  const pendingInvitations = useMemo(() => {
    return (invitations?.data as any[]) || [];
  }, [invitations?.data]);

  // Metrics summary
  const cashierCount = members.filter((m) => m.role === "CASHIER").length;
  const managerCount = members.filter((m) => m.role === "MANAGER").length;
  const staffCount = members.filter((m) => m.role === "STAFF").length;
  const adminCount = members.filter((m) => m.role === "ADMIN").length;

  const handleRevokeInvitation = async (invitation: any) => {
    try {
      setRevokingInviteId(invitation.id);
      await invitation.revoke();
      await invitations?.revalidate?.();
      if (Platform.OS === "web") {
        // quiet refresh
      } else {
        Alert.alert("Invitación revocada", `Se canceló la invitación para ${invitation.emailAddress}`);
      }
    } catch (err: any) {
      console.error("Error revoking invitation:", err);
      const msg = err?.message || "No se pudo revocar la invitación.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setRevokingInviteId(null);
    }
  };

  const onInviteSuccess = () => {
    invitations?.revalidate?.();
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const onRoleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <View className="flex-1">
      {/* Top action & metrics header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <View className="flex-1">
          <Text className="text-xl sm:text-2xl font-bold text-on-surface">
            Equipo y Cajeros
          </Text>
          <Text className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Administra los roles, cajeros POS y colaboradores autorizados en tu sucursal
          </Text>
        </View>

        {/* Invite action button */}
        {canCreateUsers && (
          <View className="self-start md:self-auto">
            <Button
              label="Invitar Colaborador"
              variant="primary"
              size="md"
              onPress={() => setIsInviteModalOpen(true)}
              leftIcon={<MaterialIcons name="person-add" size={18} color="#0d0096" />}
            />
          </View>
        )}
      </View>

      {/* Metrics Row */}
      <View className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="p-3.5 bg-surface-container-low border-surface-container-high/60">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-on-surface-variant">Cajeros Activos</Text>
            <View className="w-6 h-6 rounded-lg bg-emerald-500/15 items-center justify-center">
              <MaterialIcons name="point-of-sale" size={14} color="#34d399" />
            </View>
          </View>
          <Text className="text-2xl font-black text-on-surface mt-1.5">{cashierCount}</Text>
          <Text className="text-[11px] text-emerald-400 mt-0.5">Operan cobro POS</Text>
        </Card>

        <Card className="p-3.5 bg-surface-container-low border-surface-container-high/60">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-on-surface-variant">Gerentes</Text>
            <View className="w-6 h-6 rounded-lg bg-cyan-500/15 items-center justify-center">
              <MaterialIcons name="manage-accounts" size={14} color="#22d3ee" />
            </View>
          </View>
          <Text className="text-2xl font-black text-on-surface mt-1.5">{managerCount}</Text>
          <Text className="text-[11px] text-cyan-400 mt-0.5">Gestión y catálogo</Text>
        </Card>

        <Card className="p-3.5 bg-surface-container-low border-surface-container-high/60">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-on-surface-variant">Personal (Staff)</Text>
            <View className="w-6 h-6 rounded-lg bg-surface-container-highest items-center justify-center">
              <MaterialIcons name="badge" size={14} color="#c7c4d7" />
            </View>
          </View>
          <Text className="text-2xl font-black text-on-surface mt-1.5">{staffCount}</Text>
          <Text className="text-[11px] text-on-surface-variant mt-0.5">Operativo base</Text>
        </Card>

        <Card className="p-3.5 bg-surface-container-low border-surface-container-high/60">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-medium text-on-surface-variant">Invitaciones</Text>
            <View className="w-6 h-6 rounded-lg bg-amber-500/15 items-center justify-center">
              <MaterialIcons name="mail-outline" size={14} color="#fbbf24" />
            </View>
          </View>
          <Text className="text-2xl font-black text-on-surface mt-1.5">
            {pendingInvitations.length}
          </Text>
          <Text className="text-[11px] text-amber-400 mt-0.5">Pendientes de aceptar</Text>
        </Card>
      </View>

      {/* Pending invitations drawer / accordion banner */}
      {pendingInvitations.length > 0 && (
        <View className="mb-6 bg-surface-container-low border border-amber-500/30 rounded-2xl overflow-hidden">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPendingSection(!showPendingSection)}
            className="p-4 flex-row items-center justify-between bg-amber-500/10"
          >
            <View className="flex-row items-center gap-2.5 flex-1 mr-2">
              <MaterialIcons name="mark-email-unread" size={20} color="#fbbf24" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">
                  {pendingInvitations.length}{" "}
                  {pendingInvitations.length === 1
                    ? "Invitación pendiente de respuesta"
                    : "Invitaciones pendientes de respuesta"}
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  Los colaboradores deben aceptar la invitación enviada a su correo para unirse
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-semibold text-amber-400">
                {showPendingSection ? "Ocultar" : "Ver lista"}
              </Text>
              <MaterialIcons
                name={showPendingSection ? "expand-less" : "expand-more"}
                size={20}
                color="#fbbf24"
              />
            </View>
          </TouchableOpacity>

          {showPendingSection && (
            <View className="p-4 border-t border-surface-container-high/60 gap-3">
              {pendingInvitations.map((inv) => (
                <View
                  key={inv.id}
                  className="p-3 rounded-xl bg-surface-container border border-surface-container-high flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-3">
                    <View className="w-8 h-8 rounded-full bg-amber-500/20 items-center justify-center shrink-0">
                      <MaterialIcons name="schedule" size={16} color="#fbbf24" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-on-surface" numberOfLines={1}>
                        {inv.emailAddress}
                      </Text>
                      <Text className="text-[11px] text-on-surface-variant">
                        Invitado el {new Date(inv.createdAt).toLocaleDateString("es-MX")}
                      </Text>
                    </View>
                  </View>

                  <Button
                    label="Revocar"
                    variant="ghost"
                    size="sm"
                    loading={revokingInviteId === inv.id}
                    disabled={revokingInviteId === inv.id}
                    onPress={() => handleRevokeInvitation(inv)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Search and Role Filter Chips */}
      <View className="flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <View className="flex-1">
          <Input
            placeholder="Buscar por nombre o correo electrónico..."
            value={search}
            onChangeText={setSearch}
            iconName="search"
            rightElement={
              search ? (
                <TouchableOpacity onPress={() => setSearch("")} className="p-1">
                  <MaterialIcons name="close" size={18} color="#c7c4d7" />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="pb-1"
        >
          {(
            [
              { id: "ALL", label: "Todos" },
              { id: "CASHIER", label: "Cajeros" },
              { id: "MANAGER", label: "Gerentes" },
              { id: "STAFF", label: "Personal" },
              { id: "ADMIN", label: "Admin" },
            ] as const
          ).map((chip) => {
            const isSelected = selectedRoleFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                onPress={() => setSelectedRoleFilter(chip.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isSelected
                    ? "bg-primary-container border-primary-container text-on-primary-container"
                    : "bg-surface-container-low border-surface-container-high/60"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-on-primary-container" : "text-on-surface-variant"
                  }`}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content: Members List or Table */}
      {isLoading ? (
        <View className="p-12 items-center justify-center bg-surface-container-low rounded-3xl border border-surface-container-high">
          <ActivityIndicator size="large" color="#c0c1ff" />
          <Text className="text-sm text-on-surface-variant mt-3 font-medium">
            Cargando colaboradores de la sucursal...
          </Text>
        </View>
      ) : isError ? (
        <AlertBanner
          type="error"
          message={
            (error as any)?.message ||
            "Error al obtener los miembros del equipo. Verifica tu conexión."
          }
        />
      ) : members.length === 0 ? (
        <View className="p-12 items-center justify-center bg-surface-container-low rounded-3xl border border-surface-container-high text-center">
          <View className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center mb-3">
            <MaterialIcons name="group" size={28} color="#c7c4d7" />
          </View>
          <Text className="text-base font-bold text-on-surface">
            No se encontraron colaboradores
          </Text>
          <Text className="text-xs text-on-surface-variant mt-1 max-w-xs text-center">
            {search || selectedRoleFilter !== "ALL"
              ? "Prueba cambiando los filtros o la búsqueda."
              : "Invita a tu primer cajero o colaborador con el botón 'Invitar Colaborador'."}
          </Text>
          {canCreateUsers && (
            <View className="mt-4">
              <Button
                label="Invitar Ahora"
                variant="primary"
                size="sm"
                onPress={() => setIsInviteModalOpen(true)}
              />
            </View>
          )}
        </View>
      ) : isDesktop ? (
        /* Desktop Workstation Table View */
        <View className="bg-surface-container-low border border-surface-container-high rounded-3xl overflow-hidden">
          {/* Table Header */}
          <View className="flex-row items-center px-6 py-3.5 bg-surface-container border-b border-surface-container-high/60">
            <Text className="w-1/3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Colaborador
            </Text>
            <Text className="w-1/4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Correo Electrónico
            </Text>
            <Text className="w-1/5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Puesto / Rol
            </Text>
            <Text className="flex-1 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Acciones
            </Text>
          </View>

          {/* Table Rows */}
          <View className="divide-y divide-surface-container-high/40">
            {members.map((member) => {
              const isSelf = member.id === currentUser?.id || member.clerkId === currentUser?.clerkId;
              const roleConfig = ROLE_BADGE_CONFIG[member.role] || ROLE_BADGE_CONFIG.STAFF;
              const initial = (member.name || member.email || "U").charAt(0).toUpperCase();

              return (
                <View
                  key={member.id}
                  className="flex-row items-center px-6 py-4"
                >
                  {/* Name & Avatar */}
                  <View className="w-1/3 flex-row items-center gap-3 pr-4">
                    <View className="w-10 h-10 rounded-2xl bg-surface-container-highest border border-surface-container-high items-center justify-center shrink-0">
                      <Text className="text-base font-bold text-primary">{initial}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>
                          {member.name || "Sin nombre registrado"}
                        </Text>
                        {isSelf && (
                          <Badge label="Tú" variant="secondary" size="sm" />
                        )}
                      </View>
                      <Text className="text-xs text-on-surface-variant" numberOfLines={1}>
                        Colaborador activo
                      </Text>
                    </View>
                  </View>

                  {/* Email */}
                  <View className="w-1/4 pr-4">
                    <Text className="text-sm text-on-surface-variant" numberOfLines={1}>
                      {member.email}
                    </Text>
                  </View>

                  {/* Role Badge */}
                  <View className="w-1/5 pr-4 flex-row items-center">
                    <Badge
                      label={roleConfig.label}
                      variant={roleConfig.variant}
                      icon={<MaterialIcons name={roleConfig.icon} size={14} color="#c0c1ff" />}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-1 flex-row items-center justify-end gap-2">
                    {canUpdateUsers && !isSelf ? (
                      <Button
                        label="Cambiar Rol"
                        variant="outline"
                        size="sm"
                        onPress={() => setMemberToEditRole(member)}
                        leftIcon={
                          <MaterialIcons name="edit" size={14} color="#c0c1ff" />
                        }
                      />
                    ) : isSelf ? (
                      <Text className="text-xs text-on-surface-variant italic">
                        Cuenta activa
                      </Text>
                    ) : (
                      <Text className="text-xs text-on-surface-variant italic">
                        Solo lectura
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        /* Mobile Cards List */
        <View className="gap-3">
          {members.map((member) => {
            const isSelf = member.id === currentUser?.id || member.clerkId === currentUser?.clerkId;
            const roleConfig = ROLE_BADGE_CONFIG[member.role] || ROLE_BADGE_CONFIG.STAFF;
            const initial = (member.name || member.email || "U").charAt(0).toUpperCase();

            return (
              <Card
                key={member.id}
                className="p-4 bg-surface-container-low border-surface-container-high/60 gap-3"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-2xl bg-surface-container-highest border border-surface-container-high items-center justify-center shrink-0">
                      <Text className="text-base font-bold text-primary">{initial}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>
                          {member.name || "Sin nombre"}
                        </Text>
                        {isSelf && (
                          <Badge label="Tú" variant="secondary" size="sm" />
                        )}
                      </View>
                      <Text className="text-xs text-on-surface-variant" numberOfLines={1}>
                        {member.email}
                      </Text>
                    </View>
                  </View>

                  <Badge
                    label={roleConfig.label}
                    variant={roleConfig.variant}
                    size="sm"
                  />
                </View>

                {canUpdateUsers && !isSelf && (
                  <View className="pt-2 border-t border-surface-container-high/40 flex-row justify-end">
                    <Button
                      label="Cambiar Rol"
                      variant="outline"
                      size="sm"
                      onPress={() => setMemberToEditRole(member)}
                      leftIcon={
                        <MaterialIcons name="edit" size={14} color="#c0c1ff" />
                      }
                    />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {/* Modals */}
      <InviteMemberModal
        visible={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={onInviteSuccess}
      />

      <ChangeRoleModal
        visible={!!memberToEditRole}
        member={memberToEditRole}
        onClose={() => setMemberToEditRole(null)}
        onSuccess={onRoleUpdateSuccess}
      />
    </View>
  );
}
