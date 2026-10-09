import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import InventoryGrid from "../../../components/inventory/InventoryGrid";
import InventoryHeader from "../../../components/inventory/InventoryHeader";
import InventoryKpiGrid from "../../../components/inventory/InventoryKpiGrid";
import InventoryShortcutsBar from "../../../components/inventory/InventoryShortcutsBar";
import InventoryTable from "../../../components/inventory/InventoryTable";
import InventoryToolbar from "../../../components/inventory/InventoryToolbar";
import ProductDetailModal from "../../../components/inventory/ProductDetailModal";
import ProductFormModal from "../../../components/inventory/ProductFormModal";
import DeleteProductModal from "../../../components/inventory/DeleteProductModal";
import { BarcodeScannerModal } from "../../../components/ui/BarcodeScanner";
import { Product } from "../../../components/inventory/types";
import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import tendoApi, { PaginationMeta } from "@/services/api";
import usePermissions from "../../../hooks/usePermissions";
import { AppAction, AppResource } from "../../../types/permissions.types";

export default function InventoryScreen() {
  const { getToken } = useAuth();
  const { can } = usePermissions();
  const canCreateProducts = can(AppResource.PRODUCTS, AppAction.CREATE);
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth > 0 && windowWidth < 768;
  const isInitialMount = useRef(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean | undefined>(undefined);
  const [criticalStockOnly, setCriticalStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">(isMobile ? "grid" : "table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Default to grid on mobile on first mount
  useEffect(() => {
    if (isInitialMount.current && isMobile) {
      isInitialMount.current = false;
      setViewMode("grid");
    }
  }, [isMobile]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Debounce search query and reset page to 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInStockChange = (value?: boolean) => {
    setInStockOnly(value);
    setCurrentPage(1);
  };

  const handleToggleCriticalFilter = () => {
    setCriticalStockOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // CRUD Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailProduct, setSelectedDetailProduct] =
    useState<Product | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  const handleScanBarcode = (barcode: string) => {
    setSearchQuery(barcode);
    setDebouncedSearch(barcode);
    setCurrentPage(1);
    setIsScannerModalOpen(false);
  };

  // 1. Live Valuation Metrics Query
  const {
    data: valuationData,
    isLoading: isValuationLoading,
    refetch: refetchValuation,
  } = useQuery({
    queryKey: ["inventory-valuation"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay una sesión activa disponible");
      try {
        return await tendoApi.getInventoryValuation(token);
      } catch (err: any) {
        // If forbidden (e.g. Cashier role without reports access), return empty
        return null;
      }
    },
  });

  // 2. Paginated Products Catalog Query
  const {
    data: productsResponse,
    isLoading,
    isRefetching,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: [
      "products",
      {
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        inStock: inStockOnly,
        lowStock: criticalStockOnly || undefined,
      },
    ],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay una sesión activa disponible");
      return tendoApi.getProducts(token, {
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        inStock: inStockOnly,
        lowStock: criticalStockOnly ? true : undefined,
      });
    },
  });

  const rawProducts = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse?.data || [];

  const paginationMeta: PaginationMeta =
    productsResponse &&
    !Array.isArray(productsResponse) &&
    productsResponse.meta
      ? productsResponse.meta
      : {
          total: rawProducts.length,
          page: currentPage,
          limit: rowsPerPage,
          totalPages: Math.max(1, Math.ceil(rawProducts.length / rowsPerPage)),
          hasNextPage: false,
          hasPreviousPage: false,
        };

  // Clean products derived strictly from live backend data
  const products: Product[] = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) return [];
    return rawProducts.map((p: any) => {
      const isTracked = p.trackStock !== false;
      const isAvailable = !isTracked || (p.stock ?? 0) > 0;
      const price = Number(p.price) || 0;
      const costPrice = p.costPrice !== undefined ? Number(p.costPrice) : 0;
      const profit = price - costPrice;
      const margin =
        price > 0 && costPrice > 0
          ? Math.round(((price - costPrice) / price) * 100)
          : costPrice === 0 && price > 0
          ? 100
          : 0;

      const stockWarning = !isTracked
        ? null
        : (p.stock ?? 0) <= 0
        ? "out_of_stock"
        : (p.stock ?? 0) <= 5
        ? "low_stock"
        : null;

      const stockWarningText = !isTracked
        ? "Ilimitado"
        : (p.stock ?? 0) <= 0
        ? "Agotado"
        : (p.stock ?? 0) <= 5
        ? "Bajo Stock"
        : undefined;

      return {
        id: p.id,
        name: p.name,
        sku: p.barcode ? p.barcode : `SKU-${p.id.slice(0, 6).toUpperCase()}`,
        barcode: p.barcode,
        category: "General",
        stock: p.stock ?? 0,
        unit: p.unit || "UNIT",
        trackStock: isTracked,
        stockWarning,
        stockWarningText,
        price,
        costPrice,
        cost: costPrice,
        margin,
        profit,
        available: isAvailable,
        imageUrl: p.imageUrl || undefined,
      };
    });
  }, [rawProducts]);

  // Combined refresh
  const handleRefreshAll = () => {
    refetchProducts();
    refetchValuation();
  };

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

  // Handlers for product interactions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredSelected =
      products.length > 0 &&
      products.every((p) => selectedIds.includes(p.id));

    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleEditProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setProductToEdit(target);
      setIsFormModalOpen(true);
    }
  };

  const handleMoreOptions = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setSelectedDetailProduct(target);
      setIsDetailModalOpen(true);
    }
  };

  const handleNewProduct = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  // Real CSV Catalog Exporter
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const token = await getToken();
      if (!token) throw new Error("No hay una sesión activa disponible");

      const res = await tendoApi.getProducts(token, { page: 1, limit: 1000 });
      const items = Array.isArray(res) ? res : res?.data || [];

      if (items.length === 0) {
        Alert.alert("Catálogo Vacío", "No existen productos registrados para exportar.");
        return;
      }

      const headers = [
        "ID",
        "Nombre",
        "Codigo_Barras",
        "Precio_Venta",
        "Costo_Adquisicion",
        "Stock_Actual",
        "Unidad",
        "Control_Stock",
      ];

      const csvRows = [
        headers.join(","),
        ...items.map((it: any) => {
          const escapedName = `"${(it.name || "").replace(/"/g, '""')}"`;
          return [
            it.id,
            escapedName,
            it.barcode || "",
            Number(it.price || 0).toFixed(2),
            Number(it.costPrice || 0).toFixed(2),
            it.stock ?? 0,
            it.unit || "UNIT",
            it.trackStock !== false ? "SI" : "NO",
          ].join(",");
        }),
      ];

      const csvString = csvRows.join("\n");

      if (Platform.OS === "web") {
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `catalogo_tendo_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await Share.share({
          message: csvString,
          title: "Catálogo de Inventario Tendo",
        });
      }
    } catch (err: any) {
      Alert.alert("Error al exportar", err?.message || "No se pudo generar el archivo CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-3 sm:p-4 lg:p-6 pb-28 sm:pb-12 gap-3.5 sm:gap-6 max-w-[1720px] mx-auto w-full"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefreshAll}
          tintColor="#c0c1ff"
          colors={["#c0c1ff"]}
        />
      }
    >
      {/* 1. Header & Primary/Secondary Actions */}
      <InventoryHeader
        totalProducts={paginationMeta.total}
        onNewProduct={canCreateProducts ? handleNewProduct : undefined}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetching}
      />

      {/* 2. Live Inventory KPIs Grid */}
      <InventoryKpiGrid
        data={valuationData}
        isLoading={isValuationLoading}
        isCriticalFilterActive={criticalStockOnly}
        onToggleCriticalFilter={handleToggleCriticalFilter}
      />

      {/* 3. API-Supported Filter & Search Toolbar */}
      <InventoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onScanPress={() => setIsScannerModalOpen(true)}
        inStock={inStockOnly}
        onInStockChange={handleInStockChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Products Inventory Table or Grid View */}
      {isLoading && products.length === 0 ? (
        <View className="py-20 items-center justify-center gap-3 bg-surface-container-low rounded-2xl border border-surface-container-high/60">
          <ActivityIndicator color="#c0c1ff" size="large" />
          <Text className="text-xs text-on-surface-variant font-medium">
            Cargando catálogo de productos desde Tendo Cloud...
          </Text>
        </View>
      ) : products.length === 0 ? (
        debouncedSearch.trim().length > 0 || inStockOnly !== undefined || criticalStockOnly ? (
          <View className="p-6 sm:p-12 bg-surface-container-low rounded-2xl border border-dashed border-surface-container-high items-center justify-center gap-3 my-2 sm:my-4">
            <View className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center">
              <MaterialIcons name="search-off" size={28} color="#c7c4d7" />
            </View>
            <Text className="text-base font-bold text-on-surface text-center">
              No se han encontrado productos
            </Text>
            <Text className="text-xs text-on-surface-variant max-w-sm text-center">
              {debouncedSearch.trim().length > 0
                ? `No hay coincidencias para "${debouncedSearch.trim()}". Intenta con otro término o código de barras.`
                : criticalStockOnly
                ? "No hay productos en estado de stock bajo o crítico."
                : "No se encontraron productos coincidentes con los filtros aplicados."}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              {criticalStockOnly && (
                <TouchableOpacity
                  onPress={() => setCriticalStockOnly(false)}
                  className="bg-primary/20 border border-primary/40 px-3.5 py-2 rounded-xl"
                >
                  <Text className="text-xs font-semibold text-secondary">
                    Quitar filtro crítico
                  </Text>
                </TouchableOpacity>
              )}
              {debouncedSearch.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="bg-surface-container-high border border-surface-container-highest/60 px-4 py-2 rounded-xl"
                >
                  <Text className="text-xs font-semibold text-on-surface">
                    Limpiar búsqueda
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="p-6 sm:p-12 bg-surface-container-low rounded-2xl border border-dashed border-surface-container-high items-center justify-center gap-3 my-2 sm:my-4">
            <View className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center">
              <Text className="text-2xl">📦</Text>
            </View>
            <Text className="text-base font-bold text-on-surface">
              Tu catálogo de inventario está vacío
            </Text>
            <Text className="text-xs text-on-surface-variant max-w-sm text-center">
              Empieza registrando tu primer producto con código de barras, precio de venta y stock para tu mostrador.
            </Text>
            {canCreateProducts && (
              <TouchableOpacity
                onPress={handleNewProduct}
                className="mt-2 bg-primary px-5 py-2.5 rounded-xl flex-row items-center gap-2"
              >
                <Text className="text-xs font-bold text-on-primary">
                  + Crear Primer Producto
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      ) : viewMode === "table" ? (
        <InventoryTable
          products={products}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEditProduct={handleEditProduct}
          onMoreOptions={handleMoreOptions}
          currentPage={paginationMeta.page}
          totalPages={paginationMeta.totalPages}
          totalItems={paginationMeta.total}
          rowsPerPage={paginationMeta.limit}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      ) : (
        <InventoryGrid
          products={products}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onEditProduct={handleEditProduct}
          onMoreOptions={handleMoreOptions}
          currentPage={paginationMeta.page}
          totalPages={paginationMeta.totalPages}
          totalItems={paginationMeta.total}
          rowsPerPage={paginationMeta.limit}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      )}

      {/* 5. POS Counter Keyboard Shortcuts Utility Bar */}
      <InventoryShortcutsBar />

      {/* 6. Product Create / Edit Modal */}
      <ProductFormModal
        visible={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* 7. Product Detail Modal */}
      <ProductDetailModal
        visible={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailProduct(null);
        }}
        product={selectedDetailProduct}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setIsFormModalOpen(true);
        }}
        onDelete={(prod) => {
          setProductToDelete(prod);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* 9. Delete Product Confirmation Modal */}
      <DeleteProductModal
        visible={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        product={productToDelete}
      />

      {/* 10. Barcode Scanner Search Modal */}
      <BarcodeScannerModal
        visible={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={handleScanBarcode}
        title="Buscar Producto por Código"
        subtitle="Apunta la cámara al código de barras para buscarlo"
      />
    </ScrollView>
  );
}
