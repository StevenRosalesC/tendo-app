export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
  STAFF = "STAFF",
}

export enum AppResource {
  STORES = "stores",
  USERS = "users",
  PRODUCTS = "products",
  SALES = "sales",
  REPORTS = "reports",
}

export enum AppAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

export type PermissionMatrix = Record<
  Role,
  Partial<Record<AppResource, readonly AppAction[]>>
>;

export type UserPermissionsMap = Partial<
  Record<AppResource | string, (AppAction | string)[]>
>;
