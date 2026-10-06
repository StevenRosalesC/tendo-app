import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import SelectProductModal from "./SelectProductModal";

export interface TerminalCartProps {
  onCheckoutSuccess?: (ticketId: string, total: number) => void;
}

export default function TerminalCart({ onCheckoutSuccess }: TerminalCartProps) {
  const { getToken } = useAuth();
  const {
    items,
    customer,
    ticketNumber,
    globalDiscountPercent,
    addItem,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setCustomer,
    setGlobalDiscountPercent,
    resetTicket,
    getTotals,
  } = useCartStore();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const totals = getTotals();

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

  const handleCheckout = () => {
    if (items.length === 0) return;

    setIsProcessingCheckout(true);
    setTimeout(() => {
      setIsProcessingCheckout(false);
      const paidTotal = totals.total;
      const currentTicket = ticketNumber;

      Alert.alert(
        "¡Venta Cobrada con Éxito!",
        `Ticket: ${currentTicket}\nTotal: $${paidTotal.toFixed(2)} MXN\nCliente: ${customer.name}`,
        [
          {
            text: "Nueva Venta",
            onPress: () => {
              resetTicket();
              onCheckoutSuccess?.(currentTicket, paidTotal);
            },
          },
        ],
      );
    }, 600);
  };

  const handleCustomerPress = () => {
    const nextCustomer =
      customer.name === "Público General"
        ? { name: "Cliente Frecuente (VIP)", type: "vip" as const }
        : { name: "Público General", type: "regular" as const };
    setCustomer(nextCustomer);
  };

  return (
    <View className="flex-1 w-full flex-col gap-4">
      {/* Outer Card */}
      <View className="bg-surface-container-low border border-surface-container-high/60 rounded-3xl p-4 sm:p-5 flex-col flex-1 justify-between shadow-sm">
        {/* Header */}
        <CartHeader
          ticketNumber={ticketNumber}
          customer={customer}
          totalItems={totals.totalItems}
          totalUnits={totals.totalUnits}
          onCustomerPress={handleCustomerPress}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenManualSelect={() => setIsSelectModalOpen(true)}
        />

        {/* Quick Barcode Scanner / Manual Barcode Input Bar */}
        <View className="flex-row items-center gap-2 pt-2.5 pb-1">
          <View className="flex-1 flex-row items-center bg-surface-container border border-surface-container-high rounded-xl px-3 h-10 gap-2">
            <MaterialIcons name="qr-code-scanner" size={17} color="#908fa0" />
            <TextInput
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              onSubmitEditing={handleBarcodeSubmit}
              placeholder="Código de barras (ej. 750100...) o escanear"
              placeholderTextColor="#77767e"
              className="flex-1 text-xs text-on-surface h-full"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            {barcodeInput.length > 0 && (
              <TouchableOpacity
                onPress={() => setBarcodeInput("")}
                className="w-4 h-4 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={10} color="#c7c4d7" />
              </TouchableOpacity>
            )}
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
        <View className="flex-1 my-3 min-h-[220px]">
          {items.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8 gap-3 my-auto">
              <View className="w-16 h-16 rounded-2xl bg-surface-container-high border border-surface-container-highest/60 items-center justify-center">
                <MaterialIcons
                  name="shopping-bag"
                  size={32}
                  color="#c7c4d7"
                />
              </View>
              <Text className="text-base font-bold text-on-surface text-center">
                El carrito está vacío
              </Text>
              <Text className="text-xs text-on-surface-variant max-w-xs text-center leading-relaxed">
                Escanea artículos con el lector de código de barras, cámara o selecciónalos manualmente.
              </Text>

              <View className="flex-row items-center gap-2 mt-2 flex-wrap justify-center">
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
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-2.5 py-1"
            >
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Cart Financial Summary & Checkout Footer */}
        <CartSummary
          totals={totals}
          discountPercent={globalDiscountPercent}
          onDiscountChange={setGlobalDiscountPercent}
          onCheckout={handleCheckout}
          onClear={handleConfirmClear}
          isLoading={isProcessingCheckout}
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
    </View>
  );
}
