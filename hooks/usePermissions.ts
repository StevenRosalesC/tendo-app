import { useCallback, useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { hasPermission as checkRolePermission } from "../constants/permissions";
import {
  AppAction,
  AppResource,
  Role,
} from "../types/permissions.types";

/**
 * Custom hook for Role-Based Access Control (RBAC) in Tendo POS.
 * Connects directly to authenticated user profile and centralized permissions matrix.
 */
export function usePermissions() {
  const { user } = useCurrentUser();

  const role = (user?.role as Role) || null;
  const normalizedRole = user?.role ? (String(user.role).toUpperCase() as Role) : null;

  const isAdmin = normalizedRole === Role.ADMIN;
  const isManager = isAdmin || normalizedRole === Role.MANAGER;
  const isCashier = isManager || normalizedRole === Role.CASHIER;
  const isStaff = normalizedRole === Role.STAFF;

  const can = useCallback(
    (resource: AppResource | string, action: AppAction | string): boolean => {
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
    [user]
  );

  const capabilities = useMemo(() => {
    return {
      // Products
      canReadProducts: can(AppResource.PRODUCTS, AppAction.READ),
      canCreateProducts: can(AppResource.PRODUCTS, AppAction.CREATE),
      canUpdateProducts: can(AppResource.PRODUCTS, AppAction.UPDATE),
      canDeleteProducts: can(AppResource.PRODUCTS, AppAction.DELETE),

      // Sales / Terminal
      canCreateSales: can(AppResource.SALES, AppAction.CREATE),
      canReadSales: can(AppResource.SALES, AppAction.READ),
      canUpdateSales: can(AppResource.SALES, AppAction.UPDATE),
      canDeleteSales: can(AppResource.SALES, AppAction.DELETE),

      // Reports
      canReadReports: can(AppResource.REPORTS, AppAction.READ),
      canExportReports: can(AppResource.REPORTS, AppAction.READ),

      // Users / Staff
      canReadUsers: can(AppResource.USERS, AppAction.READ),
      canCreateUsers: can(AppResource.USERS, AppAction.CREATE),
      canUpdateUsers: can(AppResource.USERS, AppAction.UPDATE),
      canDeleteUsers: can(AppResource.USERS, AppAction.DELETE),

      // Stores
      canReadStores: can(AppResource.STORES, AppAction.READ),
      canUpdateStore: can(AppResource.STORES, AppAction.UPDATE),
    };
  }, [can]);

  return {
    user,
    role: (user?.role as Role) || null,
    permissions: user?.permissions || {},
    can,
    hasPermission: can,
    isAdmin,
    isManager,
    isCashier,
    isStaff,
    ...capabilities,
  };
}

export default usePermissions;
