import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DiscountModal from "./DiscountModal";
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
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const handleSelectPercent = (pct: number) => {
    const calculated = Number(((totals.subtotal * pct) / 100).toFixed(2));
    setDiscount(calculated);
  };

  const handleRemoveDiscount = () => {
    setDiscount(0);
  };

  const hasItems = totals.totalItems > 0;

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

        {/* Discount Row & Quick Shortcut Pills */}
        <View className="flex-col gap-1.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <TouchableOpacity
                onPress={() => setIsDiscountModalOpen(true)}
                activeOpacity={0.7}
                disabled={!hasItems}
                className="flex-row items-center gap-1.5 py-0.5 px-1 rounded-md"
              >
                <MaterialIcons name="local-offer" size={14} color="#c0c1ff" />
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
                  disabled={!hasItems}
                  className={`px-2.5 py-1 rounded-lg border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface-container-high/70 border-surface-container-highest/60"
                  }`}
                  style={{ opacity: hasItems ? 1 : 0.4 }}
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
              disabled={!hasItems}
              className="px-2.5 py-1 rounded-lg bg-surface-container-high/70 border border-surface-container-highest/60 flex-row items-center gap-1"
              style={{ opacity: hasItems ? 1 : 0.4 }}
            >
              <MaterialIcons name="tune" size={12} color="#c0c1ff" />
              <Text className="text-[11px] font-semibold text-primary">
                Otro...
              </Text>
            </TouchableOpacity>
          </View>
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
        style={{ opacity: hasItems && !isLoading ? 1 : 0.4 }}
        className={`w-full py-3.5 px-5 rounded-2xl flex-row items-center justify-between ${
          hasItems && !isLoading ? "bg-primary" : "bg-surface-container-highest"
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
            style={{ opacity: !hasItems ? 0.4 : 1 }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5"
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
          style={{ opacity: !hasItems ? 0.4 : 1 }}
          className="flex-1 py-2.5 px-3 rounded-xl border border-surface-container-highest/60 bg-surface-container-high flex-row items-center justify-center gap-1.5"
        >
          <MaterialIcons name="delete-sweep" size={16} color="#ffb4ab" />
          <Text className="text-xs font-semibold text-error">
            Vaciar Carrito
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Custom and Detailed Discount Editing */}
      <DiscountModal
        visible={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={totals.subtotal}
        currentDiscount={totals.discountAmount}
        onApplyDiscount={(amount) => setDiscount(amount)}
      />
    </View>
  );
}
