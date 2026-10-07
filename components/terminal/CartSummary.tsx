import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CartTotals } from "./types";
import useCartStore from "../../stores/useCartStore";

export interface CartSummaryProps {
  totals: CartTotals;
  discountPercent?: number; // legacy prop compatibility
  onDiscountChange?: (val: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  onHold?: () => void;
  isLoading?: boolean;
}

export default function CartSummary({
  totals,
  onCheckout,
  onClear,
  onHold,
  isLoading = false,
}: CartSummaryProps) {
  const { discount, setDiscount } = useCartStore();
  const [showDiscountSelector, setShowDiscountSelector] = useState(false);
  const [customInput, setCustomInput] = useState<string>("");

  const fixedOptions = [0, 10, 20, 50, 100].filter(
    (val) => val === 0 || val <= totals.subtotal,
  );

  const handleSelectDiscount = (amount: number) => {
    setDiscount(amount);
    setCustomInput("");
    if (amount === 0) setShowDiscountSelector(false);
  };

  const handleApplyCustom = () => {
    const num = parseFloat(customInput);
    if (!isNaN(num) && num >= 0) {
      handleSelectDiscount(Math.min(totals.subtotal, num));
      setShowDiscountSelector(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(0);
    setCustomInput("");
  };

  const hasItems = totals.totalItems > 0;

  const discountLabel =
    totals.discountAmount > 0
      ? `Descuento (-$${totals.discountAmount.toFixed(2)})`
      : "Descuento";

  return (
    <View className="bg-surface-container rounded-3xl p-4 sm:p-5 border border-surface-container-high flex-col gap-3.5 shadow-sm shrink-0">
      {/* Financial Details */}
      <View className="flex-col gap-2">
        {/* Subtotal */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-on-surface-variant font-medium">
            Subtotal ({totals.totalUnits} {totals.totalUnits === 1 ? "artículo" : "artículos"})
          </Text>
          <Text className="text-sm font-semibold font-mono text-on-surface">
            ${totals.subtotal.toFixed(2)}
          </Text>
        </View>

        {/* Discount Row */}
        <View className="flex-col gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <TouchableOpacity
                onPress={() => setShowDiscountSelector(!showDiscountSelector)}
                activeOpacity={0.7}
                className="flex-row items-center gap-1"
              >
                <Text className="text-xs text-primary font-semibold">
                  {discountLabel}
                </Text>
                <MaterialIcons
                  name={showDiscountSelector ? "expand-less" : "expand-more"}
                  size={16}
                  color="#c0c1ff"
                />
              </TouchableOpacity>

              {totals.discountAmount > 0 && (
                <TouchableOpacity
                  onPress={handleRemoveDiscount}
                  className="w-4 h-4 rounded-full bg-surface-container-highest items-center justify-center"
                >
                  <MaterialIcons name="close" size={10} color="#ffb4ab" />
                </TouchableOpacity>
              )}
            </View>

            <Text
              className={`text-sm font-mono ${
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

          {/* Expanded Discount Controls Panel */}
          {showDiscountSelector && (
            <View className="p-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high gap-2 my-1">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Seleccionar monto de descuento ($)
              </Text>

              {/* Quick Pills */}
              <View className="flex-row items-center gap-1.5 flex-wrap">
                {fixedOptions.map((opt) => {
                  const isSelected =
                    opt === 0
                      ? totals.discountAmount === 0
                      : Math.abs(totals.discountAmount - opt) < 0.01;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleSelectDiscount(opt)}
                      className={`px-2.5 py-1 rounded-lg border text-xs ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-surface-container border-surface-container-highest/60 hover:bg-surface-bright"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          isSelected
                            ? "text-on-primary font-bold"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {opt === 0 ? "Sin desc." : `$${opt}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Amount Input Row */}
              <View className="flex-row items-center gap-1.5 pt-1 border-t border-surface-container-high/60">
                <View className="flex-1 flex-row items-center bg-surface-container rounded-lg px-2 h-7 border border-surface-container-high">
                  <Text className="text-[11px] font-bold text-on-surface-variant mr-1">
                    $
                  </Text>
                  <TextInput
                    value={customInput}
                    onChangeText={setCustomInput}
                    keyboardType="numeric"
                    placeholder="Otro monto en $"
                    placeholderTextColor="#77767e"
                    className="flex-1 text-[11px] text-on-surface font-mono h-full"
                    onSubmitEditing={handleApplyCustom}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleApplyCustom}
                  className="px-2.5 h-7 rounded-lg bg-surface-container-high border border-surface-container-highest/60 items-center justify-center hover:bg-surface-container"
                >
                  <Text className="text-[11px] font-bold text-primary">
                    Aplicar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-surface-container-high my-0.5" />

        {/* Grand Total */}
        <View className="flex-row items-baseline justify-between pt-0.5">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total a Cobrar
            </Text>
          </View>

          <View className="flex-row items-baseline gap-1">
            <Text className="text-xs font-bold text-primary font-mono">$</Text>
            <Text className="text-3xl font-black text-on-surface font-mono tracking-tight">
              {totals.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Checkout CTA Button */}
      <TouchableOpacity
        onPress={onCheckout}
        disabled={!hasItems || isLoading}
        activeOpacity={0.85}
        className={`w-full py-3.5 px-5 rounded-2xl flex-row items-center justify-between shadow-lg transition-all ${
          hasItems && !isLoading
            ? "bg-primary active:scale-[0.99] hover:brightness-105"
            : "bg-surface-container-highest opacity-40"
        }`}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons
            name="payments"
            size={22}
            color={hasItems ? "#1000a9" : "#77767e"}
          />
          <Text
            className={`text-base font-bold tracking-wide ${
              hasItems ? "text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {isLoading ? "Procesando venta..." : "Cobrar Ticket"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text
            className={`text-lg font-mono font-black ${
              hasItems ? "text-on-primary" : "text-on-surface-variant"
            }`}
          >
            ${totals.total.toFixed(2)}
          </Text>
          <View className="px-1.5 py-0.5 rounded bg-black/20 hidden sm:flex">
            <Text className="text-[10px] font-mono font-bold text-on-primary">
              F12
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Secondary Controls: Hold Ticket & Clear */}
      <View className="flex-row items-center gap-2 justify-between">
        {onHold && (
          <TouchableOpacity
            onPress={onHold}
            disabled={!hasItems}
            activeOpacity={0.7}
            className={`flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5 ${
              !hasItems ? "opacity-40" : "hover:bg-surface-bright active:scale-95"
            }`}
          >
            <MaterialIcons name="pause" size={16} color="#c7c4d7" />
            <Text className="text-xs font-semibold text-on-surface">
              Pausar Ticket
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onClear}
          disabled={!hasItems}
          activeOpacity={0.7}
          className={`flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5 ${
            !hasItems ? "opacity-40" : "hover:bg-error-container/20 active:scale-95"
          }`}
        >
          <MaterialIcons name="delete-sweep" size={16} color="#ffb4ab" />
          <Text className="text-xs font-semibold text-error">
            Vaciar Carrito
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
