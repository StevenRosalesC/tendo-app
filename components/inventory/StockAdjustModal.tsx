import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tendoApi from "../../services/api";
import { ProductUnit } from "../../types/auth.types";
import AlertBanner from "../ui/AlertBanner";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { Product } from "./types";

export interface StockAdjustModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

const UNIT_LABELS: Record<ProductUnit, string> = {
  UNIT: "u",
  KG: "kg",
  LB: "lb",
  G: "g",
  L: "L",
  ML: "ml",
  M: "m",
};

export default function StockAdjustModal({
  visible,
  onClose,
  product,
  onSuccess,
}: StockAdjustModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [currentStock, setCurrentStock] = useState<number>(0);
  const [targetStock, setTargetStock] = useState<string>("0");
  const [reason, setReason] = useState<string>("Conteo físico / Auditoría");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setCurrentStock(product.stock ?? 0);
      setTargetStock(String(product.stock ?? 0));
    }
    setErrorMessage(null);
  }, [product, visible]);

  const reasonsList = [
    "Recepción de mercancía",
    "Conteo físico / Auditoría",
    "Merma / Producto dañado",
    "Devolución de cliente",
    "Ajuste manual de caja",
  ];

  const unitSuffix = product?.unit ? UNIT_LABELS[product.unit] || "u" : "u";
  const isDecimalUnit =
    product?.unit === "KG" ||
    product?.unit === "LB" ||
    product?.unit === "G" ||
    product?.unit === "L" ||
    product?.unit === "ML" ||
    product?.unit === "M";

  const quickDeltas = isDecimalUnit
    ? [+0.5, +1, +5, +10, -0.5, -1, -5]
    : [+1, +5, +10, +25, -1, -5, -10];

  const applyDelta = (delta: number) => {
    const current = parseFloat(targetStock) || 0;
    const next = Math.max(0, +(current + delta).toFixed(3));
    setTargetStock(String(next));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("No hay producto seleccionado.");
      const token = await getToken();
      if (!token) throw new Error("No active Clerk session available");

      const newStockNumber = parseFloat(targetStock);
      if (isNaN(newStockNumber) || newStockNumber < 0) {
        throw new Error("El stock debe ser un número mayor o igual a 0.");
      }

      return tendoApi.updateProductStock(token, product.id, newStockNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err?.message || "Ocurrió un error al actualizar el stock.",
      );
    },
  });

  const parsedTarget = parseFloat(targetStock) || 0;
  const difference = +(parsedTarget - currentStock).toFixed(3);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Ajuste Rápido de Stock"
      subtitle={`Sincronización en tiempo real vía WebSockets para ${product?.name || "producto"}`}
      icon="swap-vert"
      maxWidth="md"
    >
      <View className="gap-5 pb-2">
        <AlertBanner message={errorMessage} />

        {/* Warning if stock tracking is disabled for this product */}
        {product?.trackStock === false && (
          <View className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex-row items-center gap-2">
            <MaterialIcons name="info" size={16} color="#ffd279" />
            <Text className="text-xs text-amber-200 flex-1">
              Este producto está configurado sin control de existencias (venta libre/a granel).
            </Text>
          </View>
        )}

        {/* Product Info Card */}
        <View className="bg-surface-container p-4 rounded-2xl border border-surface-container-high/60 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-bold text-on-surface">
              {product?.name}
            </Text>
            <Text className="text-xs text-on-surface-variant font-mono mt-0.5">
              {product?.barcode ? `Código: ${product.barcode} • ` : "Sin código • "}
              Precio: ${product?.price?.toFixed(2)}
            </Text>
          </View>

          <View className="items-end bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-high/80">
            <Text className="text-[10px] text-on-surface-variant font-semibold uppercase">
              Stock Actual
            </Text>
            <Text className="text-lg font-bold text-primary font-mono">
              {currentStock} {unitSuffix}
            </Text>
          </View>
        </View>

        {/* Quick Delta Increment/Decrement Pills */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Ajustes Rápidos (+/-)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {quickDeltas.map((delta) => (
              <TouchableOpacity
                key={delta}
                onPress={() => applyDelta(delta)}
                className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs ${
                  delta > 0
                    ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                    : "bg-error/10 border-error/30 hover:bg-error/20"
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    delta > 0 ? "text-primary" : "text-error"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta} {unitSuffix}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Stock Input & Delta Preview */}
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <Input
              label={`Nuevo Stock Total (${unitSuffix})`}
              iconName="warehouse"
              value={targetStock}
              onChangeText={setTargetStock}
              keyboardType="decimal-pad"
            />
          </View>

          <View className="items-center justify-center p-3 rounded-xl bg-surface-container border border-surface-container-high min-w-[100px] mt-5">
            <Text className="text-[10px] text-on-surface-variant uppercase font-bold">
              Variación
            </Text>
            <Text
              className={`text-sm font-bold font-mono ${
                difference > 0
                  ? "text-primary"
                  : difference < 0
                  ? "text-error"
                  : "text-on-surface-variant"
              }`}
            >
              {difference > 0 ? `+${difference}` : difference} {unitSuffix}
            </Text>
          </View>
        </View>

        {/* Movement Reason Selector */}
        <View className="gap-2">
          <Text className="text-xs font-semibold text-on-surface-variant">
            Motivo del Movimiento
          </Text>
          <View className="flex-col gap-1.5">
            {reasonsList.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setReason(item)}
                className={`px-3 py-2 rounded-xl border flex-row items-center justify-between ${
                  reason === item
                    ? "bg-surface-container-high border-primary text-on-surface"
                    : "bg-surface-container-low border-surface-container-high/60 text-on-surface-variant"
                }`}
              >
                <Text
                  className={`text-xs ${
                    reason === item
                      ? "text-on-surface font-bold"
                      : "text-on-surface-variant"
                  }`}
                >
                  {item}
                </Text>
                {reason === item && (
                  <MaterialIcons name="check-circle" size={16} color="#c0c1ff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Buttons */}
        <View className="flex-row items-center justify-end gap-3 mt-4 pt-4 border-t border-surface-container-high/60">
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={mutation.isPending}
          />
          <Button
            label={mutation.isPending ? "Sincronizando..." : "Aplicar Ajuste"}
            rightIcon={
              <MaterialIcons name="sync" size={18} color="#0d0096" />
            }
            loading={mutation.isPending}
            onPress={() => mutation.mutate()}
          />
        </View>
      </View>
    </Modal>
  );
}
