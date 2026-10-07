import { useAuth } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tendoApi from "../../services/api";
import { BarcodeScannerModal } from "../ui/BarcodeScanner";
import useCartStore from "../../stores/useCartStore";
import CartHeader from "./CartHeader";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";
import CheckoutModal from "./CheckoutModal";
import QuantityEditModal from "./QuantityEditModal";
import SelectProductModal from "./SelectProductModal";
import { CartItem } from "./types";

export interface TerminalCartProps {
  onCheckoutSuccess?: (ticketId: string, total: number) => void;
  isDesktop?: boolean;
}

export default function TerminalCart({
  onCheckoutSuccess,
  isDesktop = false,
}: TerminalCartProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const {
    items,
    customer,
    ticketNumber,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setCustomer,
    resetTicket,
    getTotals,
  } = useCartStore();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [editingQuantityItem, setEditingQuantityItem] = useState<CartItem | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const barcodeInputRef = useRef<TextInput | null>(null);
  const totals = getTotals();

  // Keyboard shortcuts listener for Web (F3: Barcode focus, F12 or Ctrl+Enter: Checkout)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (
        (e.key === "F12" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) &&
        items.length > 0 &&
        !isCheckoutModalOpen
      ) {
        e.preventDefault();
        setIsCheckoutModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, isCheckoutModalOpen]);

  const handleScanBarcode = async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    setIsScannerOpen(false);
    setIsSearchingBarcode(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No hay sesión activa.");
      const product = await tendoApi.getProductByBarcode(token, code);
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
        setBarcodeInput("");
      }
    } catch (err: any) {
      Alert.alert(
        "Producto no encontrado",
        `No se encontró ningún artículo registrado con el código de barras: ${code}`,
        [{ text: "Aceptar" }],
      );
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const handleBarcodeSubmit = () => {
    if (barcodeInput.trim()) {
      handleScanBarcode(barcodeInput);
    }
  };

  const handleConfirmClear = () => {
    Alert.alert(
      "Vaciar Carrito",
      "¿Estás seguro de que deseas eliminar todos los productos del ticket actual?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, Vaciar", style: "destructive", onPress: () => clearCart() },
      ],
    );
  };

  const handleOpenCheckout = () => {
    if (items.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const handleCustomerPress = () => {
    const nextCustomer =
      customer.name === "Público General"
        ? { name: "Cliente Frecuente (VIP)", type: "vip" as const }
        : { name: "Público General", type: "regular" as const };
    setCustomer(nextCustomer);
  };

  return (
    <View className="flex-1 w-full flex-col min-h-0">
      {/* Outer Card Container */}
      <View className="bg-surface-container-low border border-surface-container-high/60 rounded-3xl p-4 sm:p-5 flex-col flex-1 justify-between shadow-sm min-h-0 overflow-hidden">
        {/* Ticket Header */}
        <CartHeader
          ticketNumber={ticketNumber}
          customer={customer}
          totalItems={totals.totalItems}
          totalUnits={totals.totalUnits}
          onCustomerPress={handleCustomerPress}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenManualSelect={
            isDesktop ? undefined : () => setIsSelectModalOpen(true)
          }
        />

        {/* Quick Barcode Scanner / Manual Barcode Input Bar */}
        <View className="flex-row items-center gap-2 pt-2.5 pb-1">
          <View className="flex-1 flex-row items-center bg-surface-container border border-surface-container-high rounded-xl px-3 h-10 gap-2">
            <MaterialIcons name="qr-code-scanner" size={17} color="#908fa0" />
            <TextInput
              ref={barcodeInputRef}
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              onSubmitEditing={handleBarcodeSubmit}
              placeholder={
                isDesktop
                  ? "Código de barras (F3) o escanear..."
                  : "Código de barras (ej. 750100...) o escanear"
              }
              placeholderTextColor="#77767e"
              className="flex-1 text-xs text-on-surface h-full"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            {barcodeInput.length > 0 ? (
              <TouchableOpacity
                onPress={() => setBarcodeInput("")}
                className="w-4 h-4 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={10} color="#c7c4d7" />
              </TouchableOpacity>
            ) : isDesktop ? (
              <View className="px-1.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60 hidden sm:flex">
                <Text className="text-[10px] font-mono font-bold text-on-surface-variant">
                  F3
                </Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleBarcodeSubmit}
            disabled={!barcodeInput.trim() || isSearchingBarcode}
            activeOpacity={0.7}
            className={`h-10 px-3.5 rounded-xl flex-row items-center gap-1.5 ${
              barcodeInput.trim() && !isSearchingBarcode
                ? "bg-primary active:scale-95"
                : "bg-surface-container-high opacity-50"
            }`}
          >
            {isSearchingBarcode ? (
              <ActivityIndicator size="small" color="#0d0096" />
            ) : (
              <>
                <MaterialIcons name="add" size={16} color="#0d0096" />
                <Text className="text-xs font-bold text-on-primary">
                  Agregar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Items List / Empty State */}
        <View className="flex-1 my-2.5 min-h-0">
          {items.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6 gap-3 my-auto">
              <View className="w-16 h-16 rounded-2xl bg-surface-container-high border border-surface-container-highest/60 items-center justify-center shadow-xs">
                <MaterialIcons
                  name="shopping-bag"
                  size={32}
                  color="#c7c4d7"
                />
              </View>
              <Text className="text-base font-bold text-on-surface text-center">
                {isDesktop ? "El ticket está vacío" : "El carrito está vacío"}
              </Text>
              <Text className="text-xs text-on-surface-variant max-w-xs text-center leading-relaxed">
                {isDesktop
                  ? "Haz clic en los productos del catálogo a tu izquierda o escanea un código de barras (F3) para agregar artículos."
                  : "Escanea artículos con el lector de código de barras, cámara o selecciónalos manualmente."}
              </Text>

              <View className="flex-row items-center gap-2 mt-2 flex-wrap justify-center">
                {!isDesktop && (
                  <TouchableOpacity
                    onPress={() => setIsSelectModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5 active:scale-95 hover:bg-surface-bright"
                  >
                    <MaterialIcons
                      name="search"
                      size={16}
                      color="#c0c1ff"
                    />
                    <Text className="text-xs font-bold text-primary">
                      Seleccionar Producto
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setIsScannerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-container flex-row items-center gap-1.5 active:scale-95"
                >
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={16}
                    color="#0d0096"
                  />
                  <Text className="text-xs font-bold text-on-primary-container">
                    Abrir Escáner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={true}
              contentContainerClassName="gap-2.5 py-1"
            >
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  onRemove={removeItem}
                  onEditQuantity={setEditingQuantityItem}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Cart Financial Summary & Checkout Footer */}
        <CartSummary
          totals={totals}
          onCheckout={handleOpenCheckout}
          onClear={handleConfirmClear}
          isLoading={false}
        />
      </View>

      {/* Integrated Camera Barcode Scanner Modal */}
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
          onCheckoutSuccess?.(sale.id, sale.total);
        }}
      />
    </View>
  );
}
