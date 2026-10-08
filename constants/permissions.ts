import {
  AppAction,
  AppResource,
  PermissionMatrix,
  Role,
} from "../types/permissions.types";

/**
 * Centralized RBAC Permission Matrix for Tendo POS.
 * Defines allowed actions per role for each resource/module.
 */
export const ROLE_PERMISSIONS: PermissionMatrix = {
  [Role.ADMIN]: {
    [AppResource.STORES]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
      AppAction.DELETE,
    ],
    [AppResource.USERS]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
      AppAction.DELETE,
    ],
    [AppResource.PRODUCTS]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
      AppAction.DELETE,
    ],
    [AppResource.SALES]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
      AppAction.DELETE,
    ],
    [AppResource.REPORTS]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
      AppAction.DELETE,
    ],
  },

  [Role.MANAGER]: {
    [AppResource.STORES]: [AppAction.READ],
    [AppResource.USERS]: [AppAction.CREATE, AppAction.READ],
    [AppResource.PRODUCTS]: [
      AppAction.CREATE,
      AppAction.READ,
      AppAction.UPDATE,
    ],
    [AppResource.SALES]: [AppAction.CREATE, AppAction.READ],
    [AppResource.REPORTS]: [AppAction.READ],
  },

  [Role.CASHIER]: {
    [AppResource.STORES]: [AppAction.READ],
    [AppResource.USERS]: [],
    [AppResource.PRODUCTS]: [AppAction.READ],
    [AppResource.SALES]: [AppAction.CREATE, AppAction.READ],
    [AppResource.REPORTS]: [],
  },

  [Role.STAFF]: {
    [AppResource.STORES]: [AppAction.READ],
    [AppResource.USERS]: [],
    [AppResource.PRODUCTS]: [AppAction.READ],
    [AppResource.SALES]: [AppAction.CREATE],
    [AppResource.REPORTS]: [],
  },
};

/**
 * Helper function to verify if a role has permission for a specific resource action.
 */
export function hasPermission(
  role: Role | string,
  resource: AppResource | string,
  action: AppAction | string,
): boolean {
  const normalizedRole = role as Role;
  const roleRules = ROLE_PERMISSIONS[normalizedRole];
  if (!roleRules) return false;

  const normalizedResource = resource as AppResource;
  const actions = roleRules[normalizedResource];
  if (!actions) return false;

  return actions.includes(action as AppAction);
}

/**
 * Returns the full permission map for a given role (used by frontend client).
 */
export function getPermissionsForRole(role: Role | string) {
  const normalizedRole = role as Role;
  return ROLE_PERMISSIONS[normalizedRole] ?? {};
}
