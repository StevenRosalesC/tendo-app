import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
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
import StockAdjustModal from "../../../components/inventory/StockAdjustModal";
import DeleteProductModal from "../../../components/inventory/DeleteProductModal";
import {
  initialKpis,
  initialProducts,
} from "../../../components/inventory/mockData";
import { Product } from "../../../components/inventory/types";
import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import tendoApi, { PaginationMeta } from "@/services/api";

export default function InventoryScreen() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  // CRUD Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailProduct, setSelectedDetailProduct] =
    useState<Product | null>(null);

  const {
    data: productsResponse,
    isLoading,
    isRefetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      {
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        inStock: inStockOnly,
      },
    ],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No active Clerk session token available");
      return tendoApi.getProducts(token, {
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
        inStock: inStockOnly,
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

  // Sync backend products when fetched
  useEffect(() => {
    if (productsResponse) {
      if (rawProducts.length > 0) {
        const mapped: Product[] = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: `SKU-${p.barcode ? p.barcode.slice(-4) : "0000"}`,
          barcode: p.barcode,
          category: "General",
          stock: p.stock ?? 0,
          stockWarning:
            (p.stock ?? 0) <= 0
              ? "out_of_stock"
              : (p.stock ?? 0) <= 5
              ? "low_stock"
              : null,
          stockWarningText:
            (p.stock ?? 0) <= 0
              ? "Agotado"
              : (p.stock ?? 0) <= 5
              ? "Bajo Stock"
              : undefined,
          price: Number(p.price) || 0,
          cost: Math.round((Number(p.price) || 0) * 0.65),
          margin: 35,
          channels: ["POS", "Web"],
          available: (p.stock ?? 0) > 0,
          imageUrl:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80",
        }));
        setProducts(mapped);
      } else {
        setProducts([]);
      }
    }
  }, [productsResponse]);

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

  // Server-filtered products
  const filteredProducts = products;

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
    const target = products.find((p) => p.id === id);
    if (target) {
      setProductToAdjust(target);
      setIsStockModalOpen(true);
    }
  };

  const handlePrintBarcode = (id: string) => {
    const target = products.find((p) => p.id === id);
    Alert.alert(
      "Imprimir Etiqueta",
      `Enviando código de barras ${target?.barcode} a la impresora térmica de tickets...`,
    );
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

  const handleQuickAdjust = () => {
    if (products.length > 0) {
      const target =
        products.find((p) => selectedIds.includes(p.id)) || products[0];
      setProductToAdjust(target);
      setIsStockModalOpen(true);
    } else {
      handleNewProduct();
    }
  };

  const handleImportExport = () => {
    Alert.alert(
      "Importar / Exportar",
      "Soporta CSV de catálogo, sincronización de artículos y archivo de inventario.",
    );
  };

  const handleReorderCritical = () => {
    const lowStockItem = products.find((p) => p.stock <= 5);
    if (lowStockItem) {
      setProductToAdjust(lowStockItem);
      setIsStockModalOpen(true);
    } else {
      Alert.alert(
        "Nivel Óptimo",
        "Todos los artículos cuentan con inventario por encima del umbral mínimo.",
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 lg:p-6 pb-12 gap-6 max-w-[1720px] mx-auto w-full"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor="#c0c1ff"
          colors={["#c0c1ff"]}
        />
      }
    >
      {/* 1. Header & Quick Actions Bar */}
      <InventoryHeader
        totalProducts={paginationMeta.total}
        onNewProduct={handleNewProduct}
        onQuickAdjust={handleQuickAdjust}
        onImportExport={handleImportExport}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* 2. Inventory KPIs Grid */}
      <InventoryKpiGrid
        data={initialKpis}
        onReorderCritical={handleReorderCritical}
      />

      {/* 3. API-Supported Filter & Search Toolbar */}
      <InventoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        <View className="p-12 bg-surface-container-low rounded-2xl border border-dashed border-surface-container-high items-center justify-center gap-3 my-4">
          <View className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center">
            <Text className="text-2xl">📦</Text>
          </View>
          <Text className="text-base font-bold text-on-surface">
            Tu catálogo de inventario está vacío
          </Text>
          <Text className="text-xs text-on-surface-variant max-w-sm text-center">
            Empieza registrando tu primer producto con código de barras, precio de venta y stock para tu mostrador.
          </Text>
          <TouchableOpacity
            onPress={handleNewProduct}
            className="mt-2 bg-primary px-5 py-2.5 rounded-xl flex-row items-center gap-2"
          >
            <Text className="text-xs font-bold text-on-primary">
              + Crear Primer Producto
            </Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === "table" ? (
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
          products={filteredProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAvailability={handleToggleAvailability}
          onQuickAddStock={handleQuickAddStock}
          onPrintBarcode={handlePrintBarcode}
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

      {/* 7. Stock Adjust Modal (WebSockets real-time) */}
      <StockAdjustModal
        visible={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setProductToAdjust(null);
        }}
        product={productToAdjust}
      />

      {/* 8. Product Detail Modal */}
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
        onAdjustStock={(prod) => {
          setProductToAdjust(prod);
          setIsStockModalOpen(true);
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
    </ScrollView>
  );
}
