import { AppAction, AppResource, Role } from "./permissions.types";

export { AppAction, AppResource, Role };
export type AppRole = Role | "ADMIN" | "MANAGER" | "CASHIER" | "STAFF";

export type ProductUnit = "UNIT" | "KG" | "LB" | "G" | "L" | "ML" | "M";

export interface UserPermissions {
  stores?: string[];
  users?: string[];
  products?: string[];
  sales?: string[];
  reports?: string[];
  [key: string]: string[] | undefined;
}

export interface StoreData {
  id: string;
  clerkOrgId: string;
  name: string;
  isActive: boolean;
  defaultUnit?: ProductUnit;
}

export interface AuthenticatedUserProfile {
  id: string;
  clerkId: string;
  storeId: string;
  email: string;
  name: string;
  role: AppRole;
  store: StoreData;
  permissions: UserPermissions;
}

export interface UserListItem {
  id: string;
  clerkId: string;
  storeId?: string;
  email: string;
  name: string;
  role: AppRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: AppRole;
  search?: string;
}

export interface StockUpdatedEvent {
  productId: string;
  barcode: string;
  newStock: number;
}

export interface SaleItemEvent {
  productId: string;
  quantity: number;
  priceAtSale: number;
  costPriceAtSale?: number;
}

export interface SaleCreatedEvent {
  saleId: string;
  storeId: string;
  userId: string;
  total: number;
  createdAt: string;
  items: SaleItemEvent[];
}
