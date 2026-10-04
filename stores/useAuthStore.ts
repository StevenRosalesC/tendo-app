import { create } from "zustand";
import { AuthenticatedUserProfile } from "../types/auth.types";

interface AuthState {
  user: AuthenticatedUserProfile | null;
  isInitialized: boolean;
  setUser: (user: AuthenticatedUserProfile | null) => void;
  clearUser: () => void;
  hasPermission: (
    resource: "stores" | "users" | "products" | "sales",
    action: "create" | "read" | "update" | "delete",
  ) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isCashier: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialized: false,

  setUser: (user) => set({ user, isInitialized: true }),

  clearUser: () => set({ user: null, isInitialized: true }),

  hasPermission: (resource, action) => {
    const user = get().user;
    if (!user || !user.permissions) return false;
    const resourcePermissions = user.permissions[resource];
    return Array.isArray(resourcePermissions) && resourcePermissions.includes(action);
  },

  isAdmin: () => {
    return get().user?.role === "ADMIN";
  },

  isManager: () => {
    const role = get().user?.role;
    return role === "ADMIN" || role === "MANAGER";
  },

  isCashier: () => {
    const role = get().user?.role;
    return role === "ADMIN" || role === "MANAGER" || role === "CASHIER";
  },
}));

export default useAuthStore;
