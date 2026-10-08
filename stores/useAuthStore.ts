import { create } from "zustand";
import { hasPermission as checkRolePermission } from "../constants/permissions";
import { AuthenticatedUserProfile } from "../types/auth.types";
import { AppAction, AppResource, Role } from "../types/permissions.types";

interface AuthState {
  user: AuthenticatedUserProfile | null;
  isInitialized: boolean;
  setUser: (user: AuthenticatedUserProfile | null) => void;
  clearUser: () => void;
  hasPermission: (
    resource: AppResource | string,
    action: AppAction | string,
  ) => boolean;
  can: (
    resource: AppResource | string,
    action: AppAction | string,
  ) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isCashier: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialized: false,

  setUser: (user) => set({ user, isInitialized: true }),

  clearUser: () => set({ user: null, isInitialized: true }),

  hasPermission: (resource, action) => {
    const user = get().user;
    if (!user) return false;

    // 1. Check direct permissions map returned by backend (e.g. users/me)
    if (user.permissions) {
      const resourcePermissions = user.permissions[resource as string];
      if (Array.isArray(resourcePermissions)) {
        return resourcePermissions.includes(action as string);
      }
    }

    // 2. Fallback to centralized RBAC ROLE_PERMISSIONS matrix
    if (user.role) {
      return checkRolePermission(
        user.role as Role,
        resource as AppResource,
        action as AppAction
      );
    }

    return false;
  },

  can: (resource, action) => {
    return get().hasPermission(resource, action);
  },

  isAdmin: () => {
    const role = get().user?.role;
    if (!role) return false;
    const r = String(role).toUpperCase();
    return r === Role.ADMIN || r === "ADMIN";
  },

  isManager: () => {
    const role = get().user?.role;
    if (!role) return false;
    const r = String(role).toUpperCase();
    return r === Role.ADMIN || r === "ADMIN" || r === Role.MANAGER || r === "MANAGER";
  },

  isCashier: () => {
    const role = get().user?.role;
    if (!role) return false;
    const r = String(role).toUpperCase();
    return (
      r === Role.ADMIN ||
      r === "ADMIN" ||
      r === Role.MANAGER ||
      r === "MANAGER" ||
      r === Role.CASHIER ||
      r === "CASHIER"
    );
  },

  isStaff: () => {
    const role = get().user?.role;
    if (!role) return false;
    const r = String(role).toUpperCase();
    return r === Role.STAFF || r === "STAFF";
  },
}));

export default useAuthStore;
