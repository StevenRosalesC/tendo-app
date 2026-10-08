import React, { ReactNode } from "react";
import usePermissions from "../../hooks/usePermissions";
import { AppAction, AppResource, Role } from "../../types/permissions.types";

export interface PermissionGateProps {
  resource?: AppResource | string;
  action?: AppAction | string;
  role?: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative component for conditional rendering based on RBAC permissions or roles.
 */
export default function PermissionGate({
  resource,
  action,
  role,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, user } = usePermissions();

  // 1. Role verification if specified
  if (role && user?.role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role as Role)) {
      return <>{fallback}</>;
    }
  }

  // 2. Resource & Action verification if specified
  if (resource && action) {
    if (!can(resource, action)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
