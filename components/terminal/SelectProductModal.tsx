import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tendoApi from "../../services/api";
import useCartStore from "../../stores/useCartStore";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export interface SelectProductModalProps {
  visible: boolean;
  onClose: () => void;
  onProductSelected?: (product: any) => void;
}

export default function SelectProductModal({
  visible,
  onClose,
  onProductSelected,
}: SelectProductModalProps) {
  const { getToken } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query catalog using React Query (avoids infinite loops from unstable callbacks/references)
  const {
    data: productsResponse,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "select-products-modal",
      {
        search: debouncedSearch,
        inStock: inStockOnly,
      },
    ],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No hay sesión activa.");

      return tendoApi.getProducts(token, {
        search: debouncedSearch || undefined,
        inStock: inStockOnly ? true : undefined,
        limit: 40,
      });
    },
    enabled: visible,
    staleTime: 1000 * 20, // 20s cache
  });

  const products: any[] = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse?.data || [];

  const handleAddProduct = (product: any) => {
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
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 800);

    onProductSelected?.(product);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Seleccionar Producto"
      subtitle="Busca en el catálogo y añade artículos a la venta"
      icon="inventory-2"
      maxWidth="lg"
    >
      <View className="flex-col gap-4">
        {/* Search Bar & Filter Controls */}
        <View className="flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Search Input */}
          <View className="flex-1 flex-row items-center bg-surface-container border border-surface-container-high rounded-xl px-3 h-11 gap-2">
            <MaterialIcons name="search" size={20} color="#908fa0" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre, SKU o código de barras..."
              placeholderTextColor="#77767e"
              className="flex-1 text-sm text-on-surface h-full"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-5 h-5 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={12} color="#c7c4d7" />
              </TouchableOpacity>
            )}
          </View>

          {/* In Stock Filter Toggle */}
          <TouchableOpacity
            onPress={() => setInStockOnly(!inStockOnly)}
            activeOpacity={0.7}
            className={`h-11 px-3.5 rounded-xl border flex-row items-center gap-1.5 ${
              inStockOnly
                ? "bg-primary border-primary"
                : "bg-surface-container border-surface-container-high"
            }`}
          >
            <MaterialIcons
              name={inStockOnly ? "check-circle" : "check-circle-outline"}
              size={16}
              color={inStockOnly ? "#0d0096" : "#908fa0"}
            />
            <Text
              className={`text-xs font-semibold ${
                inStockOnly ? "text-on-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              Sólo en stock
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products List Body */}
        <View className="min-h-[260px]">
          {isLoading ? (
            <View className="py-16 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#c0c1ff" />
              <Text className="text-xs text-on-surface-variant font-medium">
                Cargando catálogo de productos...
              </Text>
            </View>
          ) : isError ? (
            <View className="py-12 items-center justify-center gap-2 p-4">
              <MaterialIcons name="error-outline" size={32} color="#ffb4ab" />
              <Text className="text-sm font-bold text-on-surface text-center">
                Ocurrió un error
              </Text>
              <Text className="text-xs text-on-surface-variant text-center max-w-xs">
                {(queryError as Error)?.message || "No se pudieron cargar los productos."}
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-surface-container-highest flex-row items-center gap-1.5"
              >
                <MaterialIcons name="refresh" size={14} color="#c0c1ff" />
                <Text className="text-xs text-primary font-semibold">Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View className="py-16 items-center justify-center gap-2 p-4">
              <View className="w-14 h-14 rounded-2xl bg-surface-container items-center justify-center">
                <MaterialIcons name="search-off" size={28} color="#908fa0" />
              </View>
              <Text className="text-sm font-bold text-on-surface text-center">
                No se encontraron productos
              </Text>
              <Text className="text-xs text-on-surface-variant text-center max-w-xs">
                {searchQuery
                  ? `No hay coincidencias para "${searchQuery}". Prueba con otro término.`
                  : "No hay productos registrados en esta sucursal."}
              </Text>
            </View>
          ) : (
            <View className="gap-2 py-1">
              {products.map((product) => {
                const isTracked = product.trackStock !== false;
                const isOutOfStock =
                  isTracked &&
                  typeof product.stock === "number" &&
                  product.stock <= 0;
                const cartMatch = cartItems.find((i) => i.id === product.id);
                const isJustAdded = recentlyAddedId === product.id;
                const unitShort = product.unit
                  ? product.unit === "UNIT"
                    ? "pz"
                    : product.unit.toLowerCase()
                  : "pz";

                return (
                  <View
                    key={product.id}
                    className="p-3 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-row items-center justify-between gap-3 hover:bg-surface-bright"
                  >
                    {/* Product Info & Thumbnail */}
                    <View className="flex-row items-center gap-3 flex-1 min-w-0">
                      <View className="w-12 h-12 rounded-xl bg-surface-container-high border border-surface-container-highest/60 overflow-hidden items-center justify-center shrink-0">
                        {product.imageUrl ? (
                          <Image
                            source={{ uri: product.imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <MaterialIcons
                            name="inventory-2"
                            size={20}
                            color="#c0c1ff"
                          />
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
                            ${Number(product.price).toFixed(2)}
                            {product.unit && product.unit !== "UNIT" ? ` /${unitShort}` : ""}
                          </Text>
                          {product.barcode && (
                            <>
                              <Text className="text-xs text-on-surface-variant">
                                •
                              </Text>
                              <Text className="text-[11px] font-mono text-on-surface-variant truncate">
                                {product.barcode}
                              </Text>
                            </>
                          )}
                          {!isTracked && (
                            <>
                              <Text className="text-xs text-on-surface-variant">
                                •
                              </Text>
                              <View className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30">
                                <Text className="text-[10px] text-amber-300 font-medium">
                                  A granel
                                </Text>
                              </View>
                            </>
                          )}
                          {product.category && (
                            <>
                              <Text className="text-xs text-on-surface-variant">
                                •
                              </Text>
                              <View className="px-1.5 py-0.2 rounded bg-surface-container-high">
                                <Text className="text-[10px] text-on-surface-variant font-medium">
                                  {product.category}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Stock & Add Action */}
                    <View className="flex-row items-center gap-2.5 shrink-0">
                      {/* Stock Badge */}
                      {!isTracked ? (
                        <View className="px-2 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest">
                          <Text className="text-[10px] font-semibold text-primary">
                            Ilimitado
                          </Text>
                        </View>
                      ) : (
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? "bg-error/15 border border-error/30"
                              : "bg-surface-container-high"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-semibold ${
                              isOutOfStock ? "text-error" : "text-on-surface-variant"
                            }`}
                          >
                            {typeof product.stock === "number"
                              ? isOutOfStock
                                ? "Agotado"
                                : `Stock: ${product.stock} ${unitShort}`
                              : "Disponible"}
                          </Text>
                        </View>
                      )}

                      {/* Add Button */}
                      <TouchableOpacity
                        onPress={() => handleAddProduct(product)}
                        disabled={isOutOfStock}
                        activeOpacity={0.7}
                        className={`px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 active:scale-95 ${
                          isJustAdded
                            ? "bg-secondary"
                            : isOutOfStock
                              ? "bg-surface-container-highest opacity-40"
                              : "bg-primary-container hover:bg-primary-container/80"
                        }`}
                      >
                        <MaterialIcons
                          name={isJustAdded ? "check" : "add"}
                          size={16}
                          color={isJustAdded ? "#381e72" : "#0d0096"}
                        />
                        <Text
                          className={`text-xs font-bold ${
                            isJustAdded
                              ? "text-on-secondary"
                              : "text-on-primary-container"
                          }`}
                        >
                          {isJustAdded
                            ? "Agregado"
                            : cartMatch
                              ? `+ (${cartMatch.quantity})`
                              : "Añadir"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Modal Footer */}
        <View className="flex-row items-center justify-between pt-2 border-t border-surface-container-high/60">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="shopping-bag" size={16} color="#c0c1ff" />
            <Text className="text-xs text-on-surface-variant font-medium">
              {cartItems.length} {cartItems.length === 1 ? "artículo" : "artículos"}{" "}
              en el carrito
            </Text>
          </View>

          <Button label="Listo" variant="primary" size="sm" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
