import { ProductUnit } from "../../types/auth.types";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  costPrice?: number;
  unit?: ProductUnit;
  trackStock?: boolean;
  sku?: string;
  category?: string;
  stock?: number;
  imageUrl?: string;
  discountPercent?: number;
  notes?: string;
}

export interface CustomerInfo {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  type?: "regular" | "vip" | "wholesale";
}

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  totalUnits: number;
  totalItems: number;
}
