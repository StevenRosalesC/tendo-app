import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, View } from "react-native";

import InventoryGrid from "../../../components/inventory/InventoryGrid";
import InventoryHeader from "../../../components/inventory/InventoryHeader";
import InventoryKpiGrid from "../../../components/inventory/InventoryKpiGrid";
import InventoryShortcutsBar from "../../../components/inventory/InventoryShortcutsBar";
import InventoryTable from "../../../components/inventory/InventoryTable";
import InventoryToolbar from "../../../components/inventory/InventoryToolbar";
import {
  initialCategories,
  initialKpis,
  initialProducts,
} from "../../../components/inventory/mockData";
import { Product } from "../../../components/inventory/types";

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>(
    "Sucursal Condesa #04",
  );
  const [selectedStockCondition, setSelectedStockCondition] =
    useState<string>("Todos los Estados");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Web keyboard shortcuts listener (F4: Focus search, F3: New product, Escape: Clear)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        const searchInput = document.getElementById(
          "pos-inventory-search",
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === "F3") {
        e.preventDefault();
        handleNewProduct();
      } else if (e.key === "Escape") {
        const searchInput = document.getElementById(
          "pos-inventory-search",
        ) as HTMLInputElement | null;
        if (searchInput && document.activeElement === searchInput) {
          setSearchQuery("");
          searchInput.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter products based on search query, category, and condition
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (activeCategoryId === "bebidas" && item.category !== "Bebidas") {
        return false;
      }
      if (activeCategoryId === "alimentos" && item.category !== "Alimentos") {
        return false;
      }
      if (activeCategoryId === "accesorios" && item.category !== "Accesorios") {
        return false;
      }
      if (activeCategoryId === "bajo_stock" && item.stock >= 5) {
        return false;
      }

      // Stock condition filter
      if (selectedStockCondition === "En Stock (>15)" && item.stock <= 15) {
        return false;
      }
      if (selectedStockCondition === "Bajo Stock (<5)" && item.stock >= 5) {
        return false;
      }
      if (selectedStockCondition === "Agotados (0)" && item.stock > 0) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesBarcode = item.barcode.includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesSku || matchesBarcode || matchesCategory;
      }

      return true;
    });
  }, [products, searchQuery, activeCategoryId, selectedStockCondition]);

  // Handlers for product interactions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredSelected =
      filteredProducts.length > 0 &&
      filteredProducts.every((p) => selectedIds.includes(p.id));

    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  const handleQuickAddStock = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.stock + 10;
          return {
            ...item,
            stock: newStock,
            stockWarning: newStock > 5 ? null : item.stockWarning,
            stockWarningText: newStock > 5 ? undefined : item.stockWarningText,
          };
        }
        return item;
      }),
    );
  };

  const handlePrintBarcode = (id: string) => {
    const target = products.find((p) => p.id === id);
    Alert.alert(
      "Imprimir Etiqueta",
      `Enviando código de barras ${target?.barcode} a la impresora térmica...`,
    );
  };

  const handleEditProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    Alert.alert(
      "Editar Producto",
      `Abriendo editor para: ${target?.name} (${target?.sku})`,
    );
  };

  const handleMoreOptions = (id: string) => {
    const target = products.find((p) => p.id === id);
    Alert.alert("Opciones de Producto", `Acciones avanzadas para ${target?.name}`);
  };

  const handleNewProduct = () => {
    Alert.alert(
      "Nuevo Producto",
      "Abriendo formulario modal para alta de SKU y sincronización multicanal...",
    );
  };

  const handleQuickAdjust = () => {
    Alert.alert(
      "Ajuste Rápido",
      "Permite ajuste por conteo físico o discrepancias de caja.",
    );
  };

  const handleImportExport = () => {
    Alert.alert(
      "Importar / Exportar",
      "Soporta CSV de catálogo, Shopify Products sync y archivo SAT.",
    );
  };

  const handleReorderCritical = () => {
    Alert.alert(
      "Reordenar Lote",
      "Generando orden de reposición prioritaria para artículos críticos.",
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 lg:p-6 pb-12 gap-6 max-w-[1720px] mx-auto w-full"
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header & Quick Actions Bar */}
      <InventoryHeader
        totalProducts={145}
        totalCategories={4}
        onNewProduct={handleNewProduct}
        onQuickAdjust={handleQuickAdjust}
        onImportExport={handleImportExport}
      />

      {/* 2. Inventory KPIs Grid */}
      <InventoryKpiGrid
        data={initialKpis}
        onReorderCritical={handleReorderCritical}
      />

      {/* 3. High-Speed Filter & Search Toolbar */}
      <InventoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedStockCondition={selectedStockCondition}
        onStockConditionChange={setSelectedStockCondition}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={initialCategories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* 4. Products Inventory Table or Grid View */}
      {viewMode === "table" ? (
        <InventoryTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleAvailability={handleToggleAvailability}
          onQuickAddStock={handleQuickAddStock}
          onPrintBarcode={handlePrintBarcode}
          onEditProduct={handleEditProduct}
          onMoreOptions={handleMoreOptions}
          totalItems={145}
        />
      ) : (
        <InventoryGrid
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAvailability={handleToggleAvailability}
          onQuickAddStock={handleQuickAddStock}
          onPrintBarcode={handlePrintBarcode}
          onEditProduct={handleEditProduct}
          onMoreOptions={handleMoreOptions}
          totalItems={145}
        />
      )}

      {/* 5. POS Counter Keyboard Shortcuts Utility Bar */}
      <InventoryShortcutsBar />
    </ScrollView>
  );
}
