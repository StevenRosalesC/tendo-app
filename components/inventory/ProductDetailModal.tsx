import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "../../stores/useAuthStore";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { Product } from "./types";

export interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const UNIT_SHORT: Record<string, string> = {
  UNIT: "u",
  KG: "kg",
  LB: "lb",
  G: "g",
  L: "L",
  ML: "ml",
  M: "m",
};

export default function ProductDetailModal({
  visible,
  onClose,
  product,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  const isManagerOrAdmin = useAuthStore((s) => s.isManager());

  if (!product) return null;

  const isTracked = product.trackStock !== false;
  const isOutOfStock = isTracked && product.stock <= 0;
  const isLowStock = isTracked && product.stock > 0 && product.stock <= 5;
  const unitSuffix = product.unit ? UNIT_SHORT[product.unit] || "u" : "u";
  const costPriceVal = product.costPrice ?? product.cost ?? 0;
  const grossProfit = (product.price || 0) - costPriceVal;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Ficha del Producto"
      subtitle={`Detalles de catálogo y métricas de inventario para ${product.name}`}
      icon="inventory-2"
      maxWidth="md"
    >
      <View className="gap-5 pb-2">
        {/* Main Header & Status */}
        <View className="flex-row items-center justify-between bg-surface-container p-4 rounded-2xl border border-surface-container-high/60">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-on-surface">
              {product.name}
            </Text>
            <Text className="text-xs text-on-surface-variant font-mono mt-0.5">
              {product.barcode ? `Código / SKU: ${product.barcode}` : "Artículo sin código de barras"}
            </Text>
          </View>

          <Badge
            variant={
              !isTracked
                ? "info"
                : isOutOfStock
                ? "danger"
                : isLowStock
                ? "warning"
                : "success"
            }
            label={
              !isTracked
                ? "A Granel / Ilimitado"
                : isOutOfStock
                ? "Agotado (0)"
                : isLowStock
                ? `Bajo Stock (${product.stock} ${unitSuffix})`
                : `En Stock (${product.stock} ${unitSuffix})`
            }
          />
        </View>

        {/* Pricing & Stock Bento Cards */}
        <View className="flex-row gap-3">
          {/* Price Card */}
          <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Precio al Público
            </Text>
            <Text className="text-xl sm:text-2xl font-black text-on-surface mt-1 font-mono">
              ${product.price?.toFixed(2)}
              {product.unit && product.unit !== "UNIT" ? (
                <Text className="text-xs font-normal text-on-surface-variant font-sans">
                  {" "}
                  /{unitSuffix}
                </Text>
              ) : null}
            </Text>
            <Text className="text-[10px] text-on-surface-variant mt-1">
              IVA incluido
            </Text>
          </View>

          {/* Stock Card */}
          <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Existencias en Tienda
            </Text>
            <Text className="text-xl sm:text-2xl font-black text-primary mt-1 font-mono">
              {!isTracked ? (
                "Ilimitado"
              ) : (
                <>
                  {product.stock}{" "}
                  <Text className="text-xs font-normal text-on-surface-variant font-sans">
                    {unitSuffix}
                  </Text>
                </>
              )}
            </Text>
            <Text className="text-[10px] text-on-surface-variant mt-1">
              {!isTracked
                ? "Venta libre sin descuento de inventario"
                : "Control de inventario activo"}
            </Text>
          </View>
        </View>

        {/* Cost & Margins (Managers & Admins only) */}
        {isManagerOrAdmin && (
          <View className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 flex-row items-center justify-between">
            <View>
              <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
                Costo de Adquisición
              </Text>
              <Text className="text-base font-bold text-on-surface mt-0.5 font-mono">
                ${costPriceVal.toFixed(2)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
                Rentabilidad
              </Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <Text className="text-xs font-mono font-bold text-emerald-400">
                  {grossProfit >= 0
                    ? `+$${grossProfit.toFixed(2)}`
                    : `-$${Math.abs(grossProfit).toFixed(2)}`}
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-emerald-500/20">
                  <Text className="text-[11px] font-bold text-emerald-300 font-mono">
                    {product.margin}% mg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Barcode Banner or Granel Indicator */}
        {product.barcode ? (
          <View className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high items-center justify-center gap-2">
            {/* Barcode Graphic Stripes */}
            <View className="flex-row items-center h-12 gap-[3px] bg-white px-6 py-2 rounded-lg">
              {[2, 4, 1, 3, 2, 5, 1, 4, 3, 2, 1, 4, 2, 3, 5, 2, 1, 4, 3, 2, 4, 1, 3, 2].map(
                (w, idx) => (
                  <View
                    key={idx}
                    style={{ width: w, height: 32 }}
                    className="bg-black rounded-[0.5px]"
                  />
                ),
              )}
            </View>
            <Text className="text-xs font-mono font-bold tracking-widest text-on-surface">
              {product.barcode}
            </Text>
          </View>
        ) : (
          <View className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high items-center justify-center gap-1.5">
            <MaterialIcons name="qr-code-scanner" size={24} color="#908fa0" />
            <Text className="text-xs text-on-surface-variant text-center font-medium">
              Producto sin código de barras registrado
            </Text>
            <Text className="text-[10px] text-on-surface-variant/70 text-center">
              Disponible mediante búsqueda manual en terminal POS
            </Text>
          </View>
        )}

        {/* Action Buttons Toolbar */}
        <View className="flex-row flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high/60">
          <Button
            label="Eliminar"
            variant="danger"
            leftIcon={<MaterialIcons name="delete" size={16} color="#ffffff" />}
            onPress={() => {
              onClose();
              onDelete?.(product);
            }}
          />

          <View className="flex-row items-center gap-2">
            <Button
              label="Editar"
              leftIcon={<MaterialIcons name="edit" size={16} color="#0d0096" />}
              onPress={() => {
                onClose();
                onEdit?.(product);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
