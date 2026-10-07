import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AlertBanner from "../ui/AlertBanner";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { CartItem } from "./types";

export interface QuantityEditModalProps {
  visible: boolean;
  onClose: () => void;
  item: CartItem | null;
  onConfirm: (quantity: number) => void;
}

const UNIT_SHORT: Record<string, string> = {
  UNIT: "pz",
  KG: "kg",
  LB: "lb",
  G: "g",
  L: "L",
  ML: "ml",
  M: "m",
};

export default function QuantityEditModal({
  visible,
  onClose,
  item,
  onConfirm,
}: QuantityEditModalProps) {
  const [quantityStr, setQuantityStr] = useState<string>("1");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setQuantityStr(String(item.quantity));
    }
    setErrorMessage(null);
  }, [item, visible]);

  if (!item) return null;

  const unitSuffix = item.unit ? UNIT_SHORT[item.unit] || "pz" : "pz";
  const isDecimal =
    item.unit === "KG" ||
    item.unit === "LB" ||
    item.unit === "G" ||
    item.unit === "L" ||
    item.unit === "ML" ||
    item.unit === "M";

  const quickPills = isDecimal
    ? [0.25, 0.5, 0.75, 1.0, 1.5, 2.0]
    : [1, 2, 3, 5, 10, 12];

  const parsedQty = parseFloat(quantityStr) || 0;
  const isTracked = item.trackStock !== false;
  const maxStock =
    isTracked && typeof item.stock === "number" ? item.stock : Infinity;
  const calculatedTotal = parsedQty * item.price;

  const handleApplyQuick = (val: number) => {
    const next = Math.min(val, maxStock);
    setQuantityStr(String(next));
    setErrorMessage(null);
  };

  const handleSave = () => {
    const num = parseFloat(quantityStr);
    if (isNaN(num) || num <= 0) {
      setErrorMessage("Por favor ingresa una cantidad válida mayor a 0.");
      return;
    }
    if (isTracked && typeof item.stock === "number" && num > item.stock) {
      setErrorMessage(
        `La cantidad (${num} ${unitSuffix}) supera las existencias (${item.stock} ${unitSuffix}).`,
      );
      return;
    }

    onConfirm(num);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Cantidad / Peso"
      subtitle={`Ajuste manual para ${item.name}`}
      icon="scale"
      maxWidth="sm"
    >
      <View className="gap-4 pb-2">
        <AlertBanner message={errorMessage} />

        {/* Product summary card */}
        <View className="bg-surface-container p-3.5 rounded-2xl border border-surface-container-high/60 flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text numberOfLines={1} className="text-sm font-bold text-on-surface">
              {item.name}
            </Text>
            <Text className="text-xs text-on-surface-variant font-mono mt-0.5">
              ${item.price.toFixed(2)} /{unitSuffix}
            </Text>
          </View>
          <View className="items-end bg-surface-container-low px-2.5 py-1 rounded-xl">
            <Text className="text-[10px] text-on-surface-variant font-semibold">
              Disponibilidad
            </Text>
            <Text className="text-xs font-bold text-primary font-mono">
              {!isTracked ? "Ilimitado" : `${item.stock ?? 0} ${unitSuffix}`}
            </Text>
          </View>
        </View>

        {/* Input */}
        <Input
          label={`Cantidad o Peso Exacto (${unitSuffix})`}
          iconName="edit"
          value={quantityStr}
          onChangeText={(txt) => {
            setQuantityStr(txt);
            setErrorMessage(null);
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          autoFocus={true}
        />

        {/* Quick presets pills */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Cantidades Rápidas
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {quickPills.map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => handleApplyQuick(val)}
                className={`px-3 py-1 rounded-xl border ${
                  parsedQty === val
                    ? "bg-primary border-primary"
                    : "bg-surface-container border-surface-container-high"
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    parsedQty === val ? "text-[#0d0096]" : "text-on-surface"
                  }`}
                >
                  {val} {unitSuffix}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subtotal calculation */}
        <View className="p-3.5 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest/60 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Importe Calculado
          </Text>
          <Text className="text-base font-bold font-mono text-primary">
            ${calculatedTotal.toFixed(2)}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row items-center justify-end gap-2.5 pt-3 border-t border-surface-container-high/60">
          <Button label="Cancelar" variant="secondary" onPress={onClose} />
          <Button
            label="Aplicar"
            rightIcon={<MaterialIcons name="check" size={16} color="#0d0096" />}
            onPress={handleSave}
          />
        </View>
      </View>
    </Modal>
  );
}
