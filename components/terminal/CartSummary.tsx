import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CartTotals } from "./types";

export interface CartSummaryProps {
  totals: CartTotals;
  discountPercent: number;
  onDiscountChange: (percent: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  onHold?: () => void;
  isLoading?: boolean;
}

export default function CartSummary({
  totals,
  discountPercent,
  onDiscountChange,
  onCheckout,
  onClear,
  onHold,
  isLoading = false,
}: CartSummaryProps) {
  const [showDiscountSelector, setShowDiscountSelector] = useState(false);
  const discountOptions = [0, 5, 10, 15, 20];

  const hasItems = totals.totalItems > 0;

  return (
    <View className="bg-surface-container rounded-3xl p-5 border border-surface-container-high flex-col gap-4 shadow-sm">
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
            <TouchableOpacity
              onPress={() => setShowDiscountSelector(!showDiscountSelector)}
              activeOpacity={0.7}
              className="flex-row items-center gap-1"
            >
              <Text className="text-xs text-primary font-semibold">
                Descuento {discountPercent > 0 ? `(${discountPercent}%)` : ""}
              </Text>
              <MaterialIcons
                name={showDiscountSelector ? "expand-less" : "expand-more"}
                size={16}
                color="#c0c1ff"
              />
            </TouchableOpacity>

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

          {/* Quick Discount Selector Pills */}
          {showDiscountSelector && (
            <View className="flex-row items-center gap-1.5 py-1">
              {discountOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onDiscountChange(opt);
                    setShowDiscountSelector(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs ${
                    discountPercent === opt
                      ? "bg-primary border-primary"
                      : "bg-surface-container-high border-surface-container-highest/60 hover:bg-surface-bright"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      discountPercent === opt
                        ? "text-on-primary font-bold"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {opt === 0 ? "Sin desc." : `${opt}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Taxes (IVA 16%) */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-on-surface-variant font-medium">
            IVA Estimado (16%)
          </Text>
          <Text className="text-sm font-semibold font-mono text-on-surface-variant">
            ${totals.taxAmount.toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-surface-container-high my-1" />

        {/* Grand Total */}
        <View className="flex-row items-baseline justify-between pt-1">
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Total a Cobrar
            </Text>
            <Text className="text-[10px] text-on-surface-variant">
              IVA incluido
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
        className={`w-full py-3.5 px-5 rounded-2xl flex-row items-center justify-between shadow-lg ${
          hasItems && !isLoading
            ? "bg-primary active:scale-[0.99]"
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
            className={`flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5 ${
              !hasItems ? "opacity-40" : "hover:bg-surface-bright"
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
          className={`flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5 ${
            !hasItems ? "opacity-40" : "hover:bg-error-container/20"
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
