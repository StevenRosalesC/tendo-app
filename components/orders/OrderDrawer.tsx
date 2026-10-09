import { useAuth } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tendoApi from "../../services/api";
import useCartStore from "../../stores/useCartStore";
import { BarcodeScannerModal } from "../ui/BarcodeScanner";
import Drawer from "../ui/Drawer";
import CheckoutModal from "../terminal/CheckoutModal";
import DiscountModal from "../terminal/DiscountModal";
import QuantityEditModal from "../terminal/QuantityEditModal";
import SelectProductModal from "../terminal/SelectProductModal";
import { CartItem } from "../terminal/types";

export interface OrderDrawerProps {
  onCheckoutSuccess?: (ticketId: string, total: number) => void;
}

export default function OrderDrawer({ onCheckoutSuccess }: OrderDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    items,
    customer,
    ticketNumber,
    discount,
    isDrawerOpen,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setCustomer,
    setDiscount,
    resetTicket,
    getTotals,
  } = useCartStore();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [editingQuantityItem, setEditingQuantityItem] = useState<CartItem | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const totals = getTotals();

  const handleSelectPercent = (pct: number) => {
    const calculated = Number(((totals.subtotal * pct) / 100).toFixed(2));
    setDiscount(calculated);
  };

  const handleRemoveDiscount = () => {
    setDiscount(0);
  };

  const effectivePercent =
    totals.subtotal > 0 && totals.discountAmount > 0
      ? Math.round((totals.discountAmount / totals.subtotal) * 100)
      : 0;

  const discountLabel =
    totals.discountAmount > 0
      ? `Descuento (-$${totals.discountAmount.toFixed(2)}${
          effectivePercent > 0 ? ` • ${effectivePercent}%` : ""
        })`
      : "Descuento";

  const isOnTerminal = pathname.includes("/terminal");

  const handleScanBarcode = async (barcode: string) => {
    setIsScannerOpen(false);
    try {
      const token = await getToken();
      if (!token) throw new Error("No hay sesión activa.");
      const product = await tendoApi.getProductByBarcode(token, barcode);
      if (product) {
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
      }
    } catch (err: any) {
      Alert.alert(
        "Producto no encontrado",
        `No se encontró ningún artículo registrado con el código: ${barcode}`,
        [{ text: "Aceptar" }],
      );
    }
  };

  const handleToggleCustomer = () => {
    const nextCustomer =
      customer.name === "Público General"
        ? { name: "Cliente Frecuente (VIP)", type: "vip" as const }
        : { name: "Público General", type: "regular" as const };
    setCustomer(nextCustomer);
  };

  const handleConfirmClear = () => {
    Alert.alert(
      "Vaciar Pedido",
      "¿Estás seguro de que deseas eliminar todos los productos del pedido actual?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Vaciar",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ],
    );
  };

  const handleOpenCheckout = () => {
    if (items.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const handleGoToTerminal = () => {
    closeDrawer();
    if (!isOnTerminal) {
      router.push("/terminal");
    }
  };

  // Header quick scanner & manual search buttons
  const headerRightAction = (
    <View className="flex-row items-center gap-1.5">
      <TouchableOpacity
        onPress={() => setIsSelectModalOpen(true)}
        activeOpacity={0.7}
        accessibilityLabel="Buscar productos manualmente"
        className="h-8 px-2.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1"
      >
        <MaterialIcons name="search" size={16} color="#c0c1ff" />
        <Text className="text-xs font-semibold text-primary">
          Buscar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsScannerOpen(true)}
        activeOpacity={0.7}
        accessibilityLabel="Escanear código de barras"
        className="h-8 px-2.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1"
      >
        <MaterialIcons name="qr-code-scanner" size={16} color="#c0c1ff" />
        <Text className="text-xs font-semibold text-primary hidden sm:inline">
          Escanear
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Sticky Financial Footer
  const drawerFooter = (
    <View className="flex-col gap-3">
      {/* Financial Details */}
      <View className="flex-col gap-1.5">
        {/* Subtotal */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-on-surface-variant font-medium">
            Subtotal ({totals.totalUnits} {totals.totalUnits === 1 ? "artículo" : "artículos"})
          </Text>
          <Text className="text-xs font-semibold font-mono text-on-surface">
            ${totals.subtotal.toFixed(2)}
          </Text>
        </View>

        {/* Discount Row */}
        <View className="flex-col gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <TouchableOpacity
                onPress={() => setIsDiscountModalOpen(true)}
                activeOpacity={0.7}
                disabled={items.length === 0}
                className="flex-row items-center gap-1 py-0.5 px-1 rounded-md"
              >
                <MaterialIcons name="local-offer" size={13} color="#c0c1ff" />
                <Text className="text-xs text-primary font-semibold">
                  {discountLabel}
                </Text>
                <MaterialIcons
                  name="edit"
                  size={12}
                  color="#c0c1ff"
                />
              </TouchableOpacity>

              {totals.discountAmount > 0 && (
                <TouchableOpacity
                  onPress={handleRemoveDiscount}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="w-4 h-4 rounded-full bg-surface-container-highest items-center justify-center"
                >
                  <MaterialIcons name="close" size={10} color="#ffb4ab" />
                </TouchableOpacity>
              )}
            </View>

            <Text
              className={`text-xs font-mono ${
                totals.discountAmount > 0
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant"
              }`}
            >
              {totals.discountAmount > 0
                ? `-$${totals.discountAmount.toFixed(2)}`
                : "$0.00"}
            </Text>
          </View>

          {/* Quick 1-tap Shortcut Pills */}
          <View className="flex-row items-center gap-1.5 pt-0.5 flex-wrap">
            {[5, 10, 15, 20].map((pct) => {
              const calculatedAmount = Number(
                ((totals.subtotal * pct) / 100).toFixed(2),
              );
              const isSelected =
                totals.discountAmount > 0 &&
                Math.abs(totals.discountAmount - calculatedAmount) < 0.05;
              return (
                <TouchableOpacity
                  key={pct}
                  onPress={() => handleSelectPercent(pct)}
                  activeOpacity={0.7}
                  disabled={items.length === 0}
                  className={`px-2.5 py-1 rounded-lg border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface-container-high/70 border-surface-container-highest/60"
                  }`}
                  style={{ opacity: items.length > 0 ? 1 : 0.4 }}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      isSelected
                        ? "text-on-primary font-bold"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {pct}%
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setIsDiscountModalOpen(true)}
              activeOpacity={0.7}
              disabled={items.length === 0}
              className="px-2.5 py-1 rounded-lg border bg-surface-container-high/70 border-surface-container-highest/60 flex-row items-center gap-1"
              style={{ opacity: items.length > 0 ? 1 : 0.4 }}
            >
              <MaterialIcons name="tune" size={12} color="#c7c4d7" />
              <Text className="text-[11px] font-semibold text-on-surface-variant">
                Otro...
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-[1px] bg-surface-container-high my-1" />

        {/* Grand Total */}
        <View className="flex-row items-baseline justify-between">
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Total Pedido
            </Text>
          </View>

          <View className="flex-row items-baseline gap-1">
            <Text className="text-xs font-bold text-primary font-mono">$</Text>
            <Text className="text-2xl font-black text-on-surface font-mono tracking-tight">
              {totals.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Checkout Button */}
      <TouchableOpacity
        onPress={handleOpenCheckout}
        disabled={items.length === 0}
        activeOpacity={0.85}
        className={`w-full py-3 px-4 rounded-xl flex-row items-center justify-between ${
          items.length > 0
            ? "bg-primary"
            : "bg-surface-container-highest opacity-40"
        }`}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons
            name="payments"
            size={18}
            color={items.length > 0 ? "#1000a9" : "#77767e"}
          />
          <Text
            className={`text-sm font-bold tracking-wide ${
              items.length > 0 ? "text-on-primary" : "text-on-surface-variant"
            }`}
          >
            Cobrar Pedido
          </Text>
        </View>

        <Text
          className={`text-base font-mono font-black ${
            items.length > 0 ? "text-on-primary" : "text-on-surface-variant"
          }`}
        >
          ${totals.total.toFixed(2)}
        </Text>
      </TouchableOpacity>

      {/* Secondary Actions: Go to Terminal / Clear */}
      <View className="flex-row items-center gap-2">
        {!isOnTerminal && (
          <TouchableOpacity
            onPress={handleGoToTerminal}
            activeOpacity={0.7}
            className="flex-1 py-2 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5"
          >
            <MaterialIcons name="point-of-sale" size={15} color="#c0c1ff" />
            <Text className="text-xs font-semibold text-primary">
              Ver Terminal
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleConfirmClear}
          disabled={items.length === 0}
          activeOpacity={0.7}
          className={`flex-1 py-2 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5 ${
            items.length === 0 ? "opacity-40" : ""
          }`}
        >
          <MaterialIcons name="delete-sweep" size={15} color="#ffb4ab" />
          <Text className="text-xs font-semibold text-error">
            Vaciar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Drawer
        visible={isDrawerOpen}
        onClose={closeDrawer}
        side="left"
        icon="shopping-bag"
        title="Pedido Activo"
        subtitle={`${ticketNumber} • ${totals.totalItems} ${totals.totalItems === 1 ? "artículo" : "artículos"}`}
        headerRight={headerRightAction}
        footer={drawerFooter}
      >
        <View className="flex-col gap-3">
          {/* Customer Card */}
          <TouchableOpacity
            onPress={handleToggleCustomer}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3 rounded-2xl bg-surface-container border border-surface-container-high/60"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-xl bg-primary-container items-center justify-center">
                <MaterialIcons name="person" size={16} color="#0d0096" />
              </View>
              <View>
                <Text className="text-xs font-bold text-on-surface">
                  {customer.name}
                </Text>
                <Text className="text-[10px] text-on-surface-variant font-medium">
                  Toca para cambiar cliente
                </Text>
              </View>
            </View>

            <View className="px-2 py-0.5 rounded-full bg-secondary/15">
              <Text className="text-[10px] font-bold text-secondary">
                En Proceso
              </Text>
            </View>
          </TouchableOpacity>

          {/* Items Section */}
          {items.length === 0 ? (
            <View className="py-12 items-center justify-center gap-3">
              <View className="w-16 h-16 rounded-2xl bg-surface-container border border-surface-container-highest/50 items-center justify-center">
                <MaterialIcons name="shopping-bag" size={30} color="#908fa0" />
              </View>
              <Text className="text-sm font-bold text-on-surface text-center">
                El pedido está vacío
              </Text>
              <Text className="text-xs text-on-surface-variant text-center max-w-[240px] leading-relaxed">
                Escanea productos con el lector o cámara para agregarlos a la venta.
              </Text>

              <View className="flex-row items-center gap-2 mt-2 flex-wrap justify-center">
                <TouchableOpacity
                  onPress={() => setIsSelectModalOpen(true)}
                  activeOpacity={0.7}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5"
                >
                  <MaterialIcons name="search" size={15} color="#c0c1ff" />
                  <Text className="text-xs font-bold text-primary">
                    Seleccionar Producto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsScannerOpen(true)}
                  activeOpacity={0.7}
                  className="px-3.5 py-2 rounded-xl bg-primary-container flex-row items-center gap-1.5"
                >
                  <MaterialIcons name="qr-code-scanner" size={15} color="#0d0096" />
                  <Text className="text-xs font-bold text-on-primary-container">
                    Escanear
                  </Text>
                </TouchableOpacity>

                {!isOnTerminal && (
                  <TouchableOpacity
                    onPress={handleGoToTerminal}
                    activeOpacity={0.7}
                    className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5"
                  >
                    <MaterialIcons name="point-of-sale" size={15} color="#c0c1ff" />
                    <Text className="text-xs font-bold text-primary">
                      Terminal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View className="flex-col gap-2.5">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                const isTracked = item.trackStock !== false;
                const isMaxStock =
                  isTracked &&
                  typeof item.stock === "number" &&
                  item.quantity >= item.stock;
                const unitShort = item.unit
                  ? item.unit === "UNIT"
                    ? "u"
                    : item.unit.toLowerCase()
                  : "u";

                return (
                  <View
                    key={item.id}
                    className="p-3 rounded-2xl bg-surface-container border border-surface-container-high/50 flex-col gap-2.5"
                  >
                    {/* Item Top: Thumbnail, Title, Price, Delete */}
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
                        <View className="w-10 h-10 rounded-xl bg-surface-container-high border border-surface-container-highest/60 overflow-hidden items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <Image
                              source={{ uri: item.imageUrl }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <MaterialIcons
                              name="inventory-2"
                              size={18}
                              color="#c0c1ff"
                            />
                          )}
                        </View>

                        <View className="flex-col flex-1 min-w-0">
                          <Text
                            numberOfLines={1}
                            className="text-xs font-bold text-on-surface truncate"
                          >
                            {item.name}
                          </Text>
                          <View className="flex-row items-center gap-1.5 mt-0.5 flex-wrap">
                            <Text className="text-xs font-mono font-semibold text-primary">
                              ${item.price.toFixed(2)} /{unitShort}
                            </Text>
                            {item.barcode && (
                              <>
                                <Text className="text-[10px] text-on-surface-variant">
                                  •
                                </Text>
                                <Text className="text-[10px] font-mono text-on-surface-variant truncate">
                                  {item.barcode}
                                </Text>
                              </>
                            )}
                            {!isTracked && (
                              <>
                                <Text className="text-[10px] text-on-surface-variant">
                                  •
                                </Text>
                                <View className="px-1.5 py-0.2 rounded bg-amber-500/20">
                                  <Text className="text-[9px] text-amber-300 font-medium">
                                    A granel
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Remove Button */}
                      <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        activeOpacity={0.7}
                        className="w-7 h-7 rounded-lg items-center justify-center"
                      >
                        <MaterialIcons name="close" size={16} color="#908fa0" />
                      </TouchableOpacity>
                    </View>

                    {/* Item Bottom: Stepper and Line Total */}
                    <View className="flex-row items-center justify-between pt-1 border-t border-surface-container-high/40">
                      {/* Stepper */}
                      <View className="flex-row items-center rounded-lg bg-surface-container-high border border-surface-container-highest/60 p-0.5">
                        <TouchableOpacity
                          onPress={() => decrementQuantity(item.id)}
                          activeOpacity={0.7}
                          className="w-6 h-6 rounded items-center justify-center bg-surface-container"
                        >
                          <MaterialIcons
                            name={item.quantity === 1 ? "delete-outline" : "remove"}
                            size={14}
                            color={item.quantity === 1 ? "#ffb4ab" : "#c7c4d7"}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setEditingQuantityItem(item)}
                          activeOpacity={0.7}
                          accessibilityLabel="Modificar cantidad"
                          className="px-1.5 min-w-[28px] items-center justify-center rounded"
                        >
                          <Text className="text-[11px] font-bold font-mono text-on-surface">
                            {item.quantity} {unitShort}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => incrementQuantity(item.id)}
                          disabled={isMaxStock}
                          activeOpacity={0.7}
                          className={`w-6 h-6 rounded items-center justify-center ${
                            isMaxStock
                              ? "bg-surface-container opacity-40"
                              : "bg-surface-container"
                          }`}
                        >
                          <MaterialIcons name="add" size={14} color="#c7c4d7" />
                        </TouchableOpacity>
                      </View>

                      {/* Line Total */}
                      <View className="items-end">
                        <Text className="text-sm font-bold font-mono text-on-surface">
                          ${lineTotal.toFixed(2)}
                        </Text>
                        {item.quantity > 1 && (
                          <Text className="text-[10px] text-on-surface-variant font-mono">
                            ({item.quantity} {unitShort} × ${item.price.toFixed(2)})
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </Drawer>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanBarcode}
      />

      {/* Manual Product Selection Modal */}
      <SelectProductModal
        visible={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
      />

      {/* Direct Quantity & Weight Edit Modal */}
      <QuantityEditModal
        visible={!!editingQuantityItem}
        item={editingQuantityItem}
        onClose={() => setEditingQuantityItem(null)}
        onConfirm={(newQty) => {
          if (editingQuantityItem) {
            updateQuantity(editingQuantityItem.id, newQty);
          }
        }}
      />

      {/* Complete Checkout & Payment Modal */}
      <CheckoutModal
        visible={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onCheckoutSuccess={(sale) => {
          closeDrawer();
          onCheckoutSuccess?.(sale.id, sale.total);
        }}
      />

      {/* Discount Configuration Modal */}
      <DiscountModal
        visible={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={totals.subtotal}
        currentDiscount={totals.discountAmount}
        onApplyDiscount={(amount) => {
          setDiscount(amount);
          setIsDiscountModalOpen(false);
        }}
      />
    </>
  );
}
