import { InventoryCategoryFilter, InventoryKpiData, Product } from "./types";

export const initialKpis: InventoryKpiData = {
  valuation: {
    total: 38420.0,
    trend: "+3.2%",
    trendLabel: "vs. mes anterior (4,210 uds)",
  },
  criticalStock: {
    count: 3,
    requiresPurchaseText: "requieren compra",
    depletedTodayText: "2 agotados hoy",
  },
  bestSeller: {
    name: "Café Espresso Doble",
    units: 42,
    revenue: 189.0,
  },
  sync: {
    percentage: 100,
    latencyMs: 82,
    conflictCount: 0,
  },
};
