import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tendoApi from "../../services/api";
import useCartStore from "../../stores/useCartStore";

const UNIT_SHORT: Record<string, string> = {
  UNIT: "u",
  KG: "kg",
  LB: "lb",
  G: "g",
  L: "L",
  ML: "ml",
  M: "m",
};

export interface TerminalProductGridProps {
  onItemAdded?: (productId: string) => void;
}

export default function TerminalProductGrid({ onItemAdded }: TerminalProductGridProps) {
  const { getToken } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "inStock" | "unlimited">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Web shortcut: F2 or Escape to search
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (searchQuery.length > 0) {
          setSearchQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // Fetch catalog products
  const {
    data: productsResponse,
    isLoading,
    isRefetching,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "terminal-products-catalog",
      {
        search: debouncedSearch,
        filterType,
      },
    ],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay sesión activa.");

      return tendoApi.getProducts(token, {
        search: debouncedSearch || undefined,
        inStock: filterType === "inStock" ? true : undefined,
        limit: 100,
      });
    },
    staleTime: 1000 * 30, // 30s cache
  });

  const rawProducts: any[] = useMemo(() => {
    if (!productsResponse) return [];
    return Array.isArray(productsResponse)
      ? productsResponse
      : productsResponse?.data || [];
  }, [productsResponse]);

  // Dynamically extract unique categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawProducts.forEach((p) => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [rawProducts]);

  // Filter products by filterType and selectedCategory client-side
  const products = useMemo(() => {
    return rawProducts.filter((p) => {
      if (filterType === "unlimited" && p.trackStock !== false) {
        return false;
      }
      if (filterType === "inStock" && p.trackStock !== false && (p.stock ?? 0) <= 0) {
        return false;
      }
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [rawProducts, filterType, selectedCategory]);

  const handleProductPress = (product: any) => {
    const isTracked = product.trackStock !== false;
    const isOutOfStock = isTracked && (product.stock ?? 0) <= 0;

    if (isOutOfStock) return;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        barcode: product.barcode,
        sku: product.sku,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
        unit: product.unit,
        trackStock: product.trackStock,
        costPrice: product.costPrice,
      },
      1,
    );

    setRecentlyAddedId(product.id);
    onItemAdded?.(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 600);
  };

  return (
    <View className="flex-1 bg-surface-container-low border border-surface-container-high/60 rounded-3xl p-4 sm:p-5 flex-col shadow-sm overflow-hidden min-h-0">
      {/* Top Section: Header & Live Search Bar */}
      <View className="flex-col gap-3 pb-3 border-b border-surface-container-high/60">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2.5">
            <View className="w-9 h-9 rounded-xl bg-primary-container items-center justify-center shadow-xs">
              <MaterialIcons name="grid-view" size={20} color="#0d0096" />
            </View>
            <View>
              <Text className="text-base font-bold text-on-surface">
                Catálogo de Productos
              </Text>
              <Text className="text-[11px] text-on-surface-variant font-medium">
                Haz clic en cualquier artículo para agregarlo al ticket
              </Text>
            </View>
          </View>

          {/* Product counter badge, view switcher & refresh */}
          <View className="flex-row items-center gap-2">
            <View className="px-2.5 py-1 rounded-full bg-surface-container-high border border-surface-container-highest/60 hidden sm:flex">
              <Text className="text-xs font-semibold text-on-surface-variant font-mono">
                {products.length} {products.length === 1 ? "artículo" : "artículos"}
              </Text>
            </View>

            {/* View mode toggle: Grid / List */}
            <View className="flex-row items-center bg-surface-container border border-surface-container-high rounded-xl p-0.5">
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                accessibilityLabel="Vista en cuadrícula"
                className={`p-1.5 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-primary text-on-primary"
                    : "hover:bg-surface-container-high"
                }`}
              >
                <MaterialIcons
                  name="grid-view"
                  size={16}
                  color={viewMode === "grid" ? "#0d0096" : "#908fa0"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                accessibilityLabel="Vista en lista"
                className={`p-1.5 rounded-lg ${
                  viewMode === "list"
                    ? "bg-primary text-on-primary"
                    : "hover:bg-surface-container-high"
                }`}
              >
                <MaterialIcons
                  name="view-list"
                  size={16}
                  color={viewMode === "list" ? "#0d0096" : "#908fa0"}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => refetch()}
              disabled={isRefetching}
              className="w-8 h-8 rounded-xl bg-surface-container-high border border-surface-container-highest/60 items-center justify-center hover:bg-surface-bright active:scale-95"
              accessibilityLabel="Refrescar catálogo"
            >
              {isRefetching ? (
                <ActivityIndicator size="small" color="#c0c1ff" />
              ) : (
                <MaterialIcons name="refresh" size={16} color="#c7c4d7" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input and Filter Pills */}
        <View className="flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input with Shortcut Hint */}
          <View className="flex-1 flex-row items-center bg-surface-container border border-surface-container-high rounded-xl px-3 h-10 gap-2">
            <MaterialIcons name="search" size={18} color="#908fa0" />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre, código de barras o SKU (F2)..."
              placeholderTextColor="#77767e"
              className="flex-1 text-xs text-on-surface h-full"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="w-4 h-4 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={10} color="#c7c4d7" />
              </TouchableOpacity>
            ) : (
              <View className="px-1.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60 hidden sm:flex">
                <Text className="text-[10px] font-mono font-bold text-on-surface-variant">
                  F2
                </Text>
              </View>
            )}
          </View>

          {/* Availability Filter Pills */}
          <View className="flex-row items-center gap-1.5 self-start sm:self-auto">
            <TouchableOpacity
              onPress={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                filterType === "all"
                  ? "bg-primary border-primary"
                  : "bg-surface-container border-surface-container-high hover:bg-surface-container-high"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterType === "all" ? "text-on-primary font-bold" : "text-on-surface-variant"
                }`}
              >
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterType("inStock")}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                filterType === "inStock"
                  ? "bg-primary border-primary"
                  : "bg-surface-container border-surface-container-high hover:bg-surface-container-high"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterType === "inStock" ? "text-on-primary font-bold" : "text-on-surface-variant"
                }`}
              >
                En Stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterType("unlimited")}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                filterType === "unlimited"
                  ? "bg-primary border-primary"
                  : "bg-surface-container border-surface-container-high hover:bg-surface-container-high"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterType === "unlimited" ? "text-on-primary font-bold" : "text-on-surface-variant"
                }`}
              >
                Venta Libre
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Category Filter Chips */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row items-center gap-1.5 pt-0.5"
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg border text-xs ${
                selectedCategory === "all"
                  ? "bg-secondary-container border-secondary-container"
                  : "bg-surface-container border-surface-container-high hover:bg-surface-container-high"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  selectedCategory === "all"
                    ? "text-on-secondary-container font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                Todas las categorías
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg border text-xs ${
                  selectedCategory === cat
                    ? "bg-secondary-container border-secondary-container"
                    : "bg-surface-container border-surface-container-high hover:bg-surface-container-high"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    selectedCategory === cat
                      ? "text-on-secondary-container font-bold"
                      : "text-on-surface-variant"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Main Grid / List Body */}
      <View className="flex-1 pt-3 min-h-0">
        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3 py-20">
            <ActivityIndicator size="large" color="#c0c1ff" />
            <Text className="text-xs text-on-surface-variant font-medium">
              Cargando catálogo de productos...
            </Text>
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center gap-2 p-6">
            <MaterialIcons name="error-outline" size={32} color="#ffb4ab" />
            <Text className="text-sm font-bold text-on-surface text-center">
              Error al cargar productos
            </Text>
            <Text className="text-xs text-on-surface-variant text-center max-w-sm">
              {(queryError as Error)?.message || "No se pudo sincronizar el catálogo con Tendo Cloud."}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-2 px-4 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest flex-row items-center gap-1.5"
            >
              <MaterialIcons name="refresh" size={14} color="#c0c1ff" />
              <Text className="text-xs text-primary font-semibold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 p-8">
            <View className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center">
              <MaterialIcons name="search-off" size={28} color="#908fa0" />
            </View>
            <Text className="text-base font-bold text-on-surface text-center">
              No se encontraron productos
            </Text>
            <Text className="text-xs text-on-surface-variant text-center max-w-xs leading-relaxed">
              {searchQuery.trim().length > 0
                ? `No hay coincidencias para "${searchQuery.trim()}". Intenta con otro término o código.`
                : "No hay productos registrados en este filtro o categoría."}
            </Text>
            {(searchQuery.trim().length > 0 || selectedCategory !== "all") && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-1 bg-surface-container-high border border-surface-container-highest/60 px-4 py-2 rounded-xl"
              >
                <Text className="text-xs font-semibold text-on-surface">
                  Restablecer filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : viewMode === "grid" ? (
          /* Grid View Mode */
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerClassName="pb-6"
          >
            <View className="flex-row flex-wrap -m-1.5">
              {products.map((product) => {
                const isTracked = product.trackStock !== false;
                const stockVal = Number(product.stock ?? 0);
                const isOutOfStock = isTracked && stockVal <= 0;
                const isLowStock = isTracked && stockVal > 0 && stockVal <= 5;
                const unitSuffix = product.unit ? UNIT_SHORT[product.unit] || "u" : "u";

                const cartMatch = cartItems.find((i) => i.id === product.id);
                const quantityInCart = cartMatch?.quantity || 0;
                const isJustAdded = recentlyAddedId === product.id;

                return (
                  <View
                    key={product.id}
                    className="w-1/2 sm:w-1/3 md:w-1/3 lg:w-1/3 xl:w-1/4 2xl:w-1/5 p-1.5"
                  >
                    <TouchableOpacity
                      onPress={() => handleProductPress(product)}
                      disabled={isOutOfStock}
                      activeOpacity={0.75}
                      className={`rounded-2xl p-3 flex-col justify-between border shadow-xs min-h-[148px] relative transition-all ${
                        isJustAdded
                          ? "bg-primary/25 border-primary scale-[1.02]"
                          : isOutOfStock
                          ? "bg-surface-container/30 border-surface-container-high/40 opacity-55"
                          : quantityInCart > 0
                          ? "bg-surface-container border-primary/60 shadow-sm"
                          : "bg-surface-container border-surface-container-high/70 hover:border-surface-container-highest hover:bg-surface-bright"
                      }`}
                    >
                      {/* Top Row: Thumbnail/Icon & In-Cart Badge */}
                      <View className="flex-row items-center justify-between">
                        <View className="w-9 h-9 rounded-xl bg-surface-container-high border border-surface-container-highest/50 overflow-hidden items-center justify-center shrink-0">
                          {product.imageUrl ? (
                            <Image
                              source={{ uri: product.imageUrl }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <MaterialIcons name="inventory-2" size={17} color="#c0c1ff" />
                          )}
                        </View>

                        {/* Cart Quantity Badge */}
                        {quantityInCart > 0 && (
                          <View className="px-2 py-0.5 rounded-full bg-primary flex-row items-center gap-1 shadow-xs">
                            <MaterialIcons name="shopping-bag" size={10} color="#0d0096" />
                            <Text className="text-[10px] font-bold text-on-primary font-mono">
                              {quantityInCart} {unitSuffix}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Middle: Product Name & Code */}
                      <View className="flex-col gap-0.5 my-1.5">
                        <Text
                          numberOfLines={2}
                          className="text-xs font-bold text-on-surface leading-tight"
                        >
                          {product.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-[10px] font-mono text-on-surface-variant truncate"
                        >
                          {product.barcode || product.sku || "Sin código"}
                        </Text>
                      </View>

                      {/* Bottom Row: Price & Stock Status Badge */}
                      <View className="flex-row items-center justify-between pt-1 border-t border-surface-container-high/40">
                        <Text className="text-sm font-black text-on-surface font-mono">
                          ${Number(product.price || 0).toFixed(2)}
                        </Text>

                        {!isTracked ? (
                          <View className="px-1.5 py-0.2 rounded bg-secondary/15">
                            <Text className="text-[9px] font-bold text-secondary">
                              Libre
                            </Text>
                          </View>
                        ) : isOutOfStock ? (
                          <View className="px-1.5 py-0.2 rounded bg-error/20">
                            <Text className="text-[9px] font-bold text-error">
                              Agotado
                            </Text>
                          </View>
                        ) : isLowStock ? (
                          <View className="px-1.5 py-0.2 rounded bg-amber-500/20">
                            <Text className="text-[9px] font-bold text-amber-300 font-mono">
                              {stockVal} {unitSuffix}
                            </Text>
                          </View>
                        ) : (
                          <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                            <Text className="text-[9px] font-semibold text-on-surface-variant font-mono">
                              {stockVal} {unitSuffix}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          /* List View Mode (Compact Retail / Pharmacy layout) */
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerClassName="gap-2 pb-6"
          >
            {products.map((product) => {
              const isTracked = product.trackStock !== false;
              const stockVal = Number(product.stock ?? 0);
              const isOutOfStock = isTracked && stockVal <= 0;
              const isLowStock = isTracked && stockVal > 0 && stockVal <= 5;
              const unitSuffix = product.unit ? UNIT_SHORT[product.unit] || "u" : "u";

              const cartMatch = cartItems.find((i) => i.id === product.id);
              const quantityInCart = cartMatch?.quantity || 0;
              const isJustAdded = recentlyAddedId === product.id;

              return (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => handleProductPress(product)}
                  disabled={isOutOfStock}
                  activeOpacity={0.75}
                  className={`p-3 rounded-2xl border flex-row items-center justify-between gap-3 transition-all ${
                    isJustAdded
                      ? "bg-primary/20 border-primary"
                      : isOutOfStock
                      ? "bg-surface-container/30 border-surface-container-high/40 opacity-55"
                      : quantityInCart > 0
                      ? "bg-surface-container border-primary/50"
                      : "bg-surface-container border-surface-container-high/60 hover:bg-surface-bright"
                  }`}
                >
                  {/* Thumbnail & Product Details */}
                  <View className="flex-row items-center gap-3 flex-1 min-w-0">
                    <View className="w-10 h-10 rounded-xl bg-surface-container-high border border-surface-container-highest/50 overflow-hidden items-center justify-center shrink-0">
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialIcons name="inventory-2" size={18} color="#c0c1ff" />
                      )}
                    </View>

                    <View className="flex-col flex-1 min-w-0">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-on-surface truncate"
                      >
                        {product.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
                        <Text className="text-xs font-mono font-bold text-primary">
                          ${Number(product.price || 0).toFixed(2)}
                        </Text>
                        {product.barcode && (
                          <>
                            <Text className="text-xs text-on-surface-variant">•</Text>
                            <Text className="text-[11px] font-mono text-on-surface-variant truncate">
                              {product.barcode}
                            </Text>
                          </>
                        )}
                        {product.category && (
                          <>
                            <Text className="text-xs text-on-surface-variant">•</Text>
                            <Text className="text-[10px] text-on-surface-variant">
                              {product.category}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Stock status & Action */}
                  <View className="flex-row items-center gap-3 shrink-0">
                    {!isTracked ? (
                      <View className="px-2 py-0.5 rounded-full bg-secondary/15">
                        <Text className="text-[10px] font-bold text-secondary">
                          Libre
                        </Text>
                      </View>
                    ) : isOutOfStock ? (
                      <View className="px-2 py-0.5 rounded-full bg-error/20">
                        <Text className="text-[10px] font-bold text-error">
                          Agotado
                        </Text>
                      </View>
                    ) : isLowStock ? (
                      <View className="px-2 py-0.5 rounded-full bg-amber-500/20">
                        <Text className="text-[10px] font-bold text-amber-300 font-mono">
                          {stockVal} {unitSuffix}
                        </Text>
                      </View>
                    ) : (
                      <View className="px-2 py-0.5 rounded-full bg-surface-container-high">
                        <Text className="text-[10px] font-semibold text-on-surface-variant font-mono">
                          {stockVal} {unitSuffix}
                        </Text>
                      </View>
                    )}

                    <View
                      className={`w-8 h-8 rounded-xl items-center justify-center ${
                        quantityInCart > 0
                          ? "bg-primary text-on-primary"
                          : "bg-primary-container text-on-primary-container"
                      }`}
                    >
                      <MaterialIcons
                        name={quantityInCart > 0 ? "add" : "add-shopping-cart"}
                        size={16}
                        color={quantityInCart > 0 ? "#0d0096" : "#0d0096"}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
