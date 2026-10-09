import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export interface DiscountModalProps {
  visible: boolean;
  onClose: () => void;
  subtotal: number;
  currentDiscount: number;
  onApplyDiscount: (amount: number) => void;
}

export default function DiscountModal({
  visible,
  onClose,
  subtotal,
  currentDiscount,
  onApplyDiscount,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    if (visible) {
      if (currentDiscount > 0 && subtotal > 0) {
        const pct = (currentDiscount / subtotal) * 100;
        // If it's a round percentage like 5, 10, 15, 20
        if (Math.abs(pct - Math.round(pct)) < 0.05) {
          setDiscountType("percent");
          setInputValue(Math.round(pct).toString());
        } else {
          setDiscountType("amount");
          setInputValue(currentDiscount.toFixed(2));
        }
      } else {
        setDiscountType("percent");
        setInputValue("");
      }
    }
  }, [visible, currentDiscount, subtotal]);

  const num = parseFloat(inputValue) || 0;
  let calculatedDiscount = 0;
  let calculatedPercent = 0;

  if (num > 0 && subtotal > 0) {
    if (discountType === "percent") {
      const clampedPct = Math.min(100, Math.max(0, num));
      calculatedPercent = clampedPct;
      calculatedDiscount = Number(((subtotal * clampedPct) / 100).toFixed(2));
    } else {
      calculatedDiscount = Math.min(subtotal, Math.max(0, num));
      calculatedPercent = Math.round((calculatedDiscount / subtotal) * 100);
    }
  }

  const finalTotal = Math.max(0, Number((subtotal - calculatedDiscount).toFixed(2)));

  const handlePresetPercent = (pct: number) => {
    setDiscountType("percent");
    setInputValue(pct.toString());
  };

  const handlePresetAmount = (amt: number) => {
    setDiscountType("amount");
    setInputValue(amt.toString());
  };

  const handleApply = () => {
    onApplyDiscount(calculatedDiscount);
    onClose();
  };

  const handleRemove = () => {
    onApplyDiscount(0);
    onClose();
  };

  const fixedPercentPresets = [5, 10, 15, 20, 50];
  const fixedAmountPresets = [10, 20, 50, 100].filter((amt) => amt <= subtotal);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Descuento al Ticket"
      subtitle={`Subtotal del ticket: $${subtotal.toFixed(2)}`}
      icon="local-offer"
      maxWidth="md"
    >
      <View className="gap-5">
        {/* Mode Selector Segmented Control */}
        <View className="flex-row p-1 bg-surface-container rounded-2xl border border-surface-container-high">
          <TouchableOpacity
            onPress={() => {
              setDiscountType("percent");
              setInputValue("");
            }}
            activeOpacity={0.7}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
              discountType === "percent"
                ? "bg-primary"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs sm:text-sm font-bold ${
                discountType === "percent"
                  ? "text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              Porcentaje (%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setDiscountType("amount");
              setInputValue("");
            }}
            activeOpacity={0.7}
            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
              discountType === "amount"
                ? "bg-primary"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs sm:text-sm font-bold ${
                discountType === "amount"
                  ? "text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              Monto Fijo ($)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Presets */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Sugerencias rápidas
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            {discountType === "percent"
              ? fixedPercentPresets.map((pct) => {
                  const isSelected =
                    discountType === "percent" && num === pct;
                  return (
                    <TouchableOpacity
                      key={pct}
                      onPress={() => handlePresetPercent(pct)}
                      activeOpacity={0.7}
                      className={`px-3.5 py-2 rounded-xl border ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-surface-container border-surface-container-high"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-on-primary"
                            : "text-on-surface"
                        }`}
                      >
                        {pct}%
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : fixedAmountPresets.map((amt) => {
                  const isSelected =
                    discountType === "amount" && num === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => handlePresetAmount(amt)}
                      activeOpacity={0.7}
                      className={`px-3.5 py-2 rounded-xl border ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-surface-container border-surface-container-high"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-on-primary"
                            : "text-on-surface"
                        }`}
                      >
                        ${amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
          </View>
        </View>

        {/* Primary Input Field */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-on-surface-variant">
            {discountType === "percent"
              ? "Ingresar porcentaje de descuento"
              : "Ingresar monto de descuento en efectivo"}
          </Text>

          <View className="flex-row items-center bg-surface-container rounded-2xl px-4 h-14 border border-surface-container-high">
            <View className="w-9 h-9 rounded-xl bg-primary-container items-center justify-center mr-3 shrink-0">
              <Text className="text-base font-bold text-on-primary-container">
                {discountType === "percent" ? "%" : "$"}
              </Text>
            </View>

            <TextInput
              value={inputValue}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                setInputValue(cleaned);
              }}
              keyboardType="numeric"
              placeholder={discountType === "percent" ? "0 %" : "0.00"}
              placeholderTextColor="#77767e"
              className="flex-1 text-2xl font-bold font-mono text-on-surface h-full"
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleApply}
            />

            {inputValue.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputValue("")}
                className="w-7 h-7 rounded-full bg-surface-container-highest items-center justify-center shrink-0"
              >
                <MaterialIcons name="close" size={16} color="#c7c4d7" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Live Calculation Feedback Card */}
        <View className="p-4 rounded-2xl bg-surface-container/60 border border-surface-container-high flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-xs text-on-surface-variant font-medium">
              Descuento a aplicar
            </Text>
            <Text className="text-base sm:text-lg font-bold font-mono text-secondary">
              -${calculatedDiscount.toFixed(2)}
              {calculatedPercent > 0 ? ` (${calculatedPercent}%)` : ""}
            </Text>
          </View>

          <View className="items-end gap-0.5">
            <Text className="text-xs text-on-surface-variant font-medium">
              Nuevo Total del Ticket
            </Text>
            <Text className="text-xl sm:text-2xl font-black font-mono text-on-surface">
              ${finalTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row items-center justify-between gap-3 pt-2 border-t border-surface-container-high/60">
          {currentDiscount > 0 ? (
            <Button
              label="Quitar Descuento"
              variant="danger"
              leftIcon={<MaterialIcons name="delete" size={18} color="#ffb4ab" />}
              onPress={handleRemove}
            />
          ) : (
            <Button label="Cancelar" variant="secondary" onPress={onClose} />
          )}

          <Button
            label="Aplicar Descuento"
            variant="primary"
            rightIcon={<MaterialIcons name="check" size={18} color="#0d0096" />}
            onPress={handleApply}
          />
        </View>
      </View>
    </Modal>
  );
}
