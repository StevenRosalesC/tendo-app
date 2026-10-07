import { ProductUnit } from "../../types/auth.types";

export type ChannelType = "POS" | "Web";

export type StockWarningType = "low_stock" | "out_of_stock" | null;

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  stock: number;
  stockBreakdown?: string;
  stockWarning?: StockWarningType;
  stockWarningText?: string;
  price: number;
  costPrice?: number;
  cost: number;
  margin: number;
  profit?: number;
  unit?: ProductUnit;
  trackStock?: boolean;
  channels?: ChannelType[];
  available: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export interface InventoryCategoryFilter {
  id: string;
  label: string;
  count: number;
  isWarning?: boolean;
}

export interface InventoryKpiData {
  totalProducts: number;
  totalUnitsInStock: number;
  totalInventoryCost: number;
  totalInventoryRetail: number;
  potentialProfit: number;
  criticalStockCount?: number;
  outOfStockCount?: number;
}
