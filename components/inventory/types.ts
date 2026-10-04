export type ChannelType = "POS" | "Web";

export type StockWarningType = "low_stock" | "out_of_stock" | null;

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  stock: number;
  stockBreakdown?: string;
  stockWarning?: StockWarningType;
  stockWarningText?: string;
  price: number;
  cost: number;
  margin: number;
  channels: ChannelType[];
  available: boolean;
  imageUrl: string;
  imageAlt?: string;
}

export interface InventoryCategoryFilter {
  id: string;
  label: string;
  count: number;
  isWarning?: boolean;
}

export interface InventoryKpiData {
  valuation: {
    total: number;
    trend: string;
    trendLabel: string;
  };
  criticalStock: {
    count: number;
    requiresPurchaseText: string;
    depletedTodayText: string;
  };
  bestSeller: {
    name: string;
    units: number;
    revenue: number;
  };
  sync: {
    percentage: number;
    latencyMs: number;
    conflictCount: number;
  };
}
