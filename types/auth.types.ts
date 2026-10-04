export type AppRole = "ADMIN" | "MANAGER" | "CASHIER" | "STAFF";

export interface UserPermissions {
  stores: string[];
  users: string[];
  products: string[];
  sales: string[];
}

export interface StoreData {
  id: string;
  clerkOrgId: string;
  name: string;
  isActive: boolean;
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

export interface StockUpdatedEvent {
  productId: string;
  barcode: string;
  newStock: number;
}

export interface SaleItemEvent {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface SaleCreatedEvent {
  saleId: string;
  storeId: string;
  userId: string;
  total: number;
  createdAt: string;
  items: SaleItemEvent[];
}
