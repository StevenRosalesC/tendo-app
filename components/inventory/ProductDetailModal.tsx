import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { Product } from "./types";

export interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
  onEdit?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductDetailModal({
  visible,
  onClose,
  product,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductDetailModalProps) {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

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
              Código / SKU: {product.barcode}
            </Text>
          </View>

          <Badge
            variant={isOutOfStock ? "danger" : isLowStock ? "warning" : "success"}
            label={
              isOutOfStock
                ? "Agotado (0)"
                : isLowStock
                ? `Bajo Stock (${product.stock})`
                : `En Stock (${product.stock})`
            }
          />
        </View>

        {/* Pricing & Margin Bento Cards */}
        <View className="flex-row gap-3">
          {/* Price Card */}
          <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Precio al Público
            </Text>
            <Text className="text-xl sm:text-2xl font-black text-on-surface mt-1">
              ${product.price?.toFixed(2)}
            </Text>
            <Text className="text-[10px] text-on-surface-variant mt-1">
              Moneda: MXN • IVA incluido
            </Text>
          </View>

          {/* Stock Card */}
          <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60">
            <Text className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Existencias en Tienda
            </Text>
            <Text className="text-xl sm:text-2xl font-black text-primary mt-1">
              {product.stock} <Text className="text-xs font-normal">uds.</Text>
            </Text>
            <Text className="text-[10px] text-on-surface-variant mt-1">
              Almacén Principal Condesa
            </Text>
          </View>
        </View>

        {/* Simulated Barcode Banner */}
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
              label="Ajustar Stock"
              variant="secondary"
              leftIcon={<MaterialIcons name="swap-vert" size={16} color="#c0c1ff" />}
              onPress={() => {
                onClose();
                onAdjustStock?.(product);
              }}
            />

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
