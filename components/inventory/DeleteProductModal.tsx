import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Text, View } from "react-native";
import tendoApi from "../../services/api";
import usePermissions from "../../hooks/usePermissions";
import { AppAction, AppResource } from "../../types/permissions.types";
import AlertBanner from "../ui/AlertBanner";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { Product } from "./types";

export interface DeleteProductModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export default function DeleteProductModal({
  visible,
  onClose,
  product,
  onSuccess,
}: DeleteProductModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canDeleteProducts = can(AppResource.PRODUCTS, AppAction.DELETE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("No hay producto seleccionado.");
      if (!canDeleteProducts) {
        throw new Error("No tienes permisos para eliminar productos del catálogo.");
      }
      const token = await getToken();
      if (!token) throw new Error("No se encontró una sesión activa.");

      return tendoApi.deleteProduct(token, product.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err?.message || "Ocurrió un error al eliminar el producto.",
      );
    },
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Eliminar Producto"
      subtitle="Esta acción no se puede deshacer"
      icon="warning"
      maxWidth="sm"
    >
      <View className="gap-4 pb-2">
        <AlertBanner message={errorMessage} />

        <View className="bg-error-container/20 border border-error/30 p-4 rounded-2xl gap-2">
          <Text className="text-sm font-bold text-on-surface">
            ¿Confirmas la eliminación del siguiente producto?
          </Text>
          <View className="bg-surface-container p-3 rounded-xl gap-1">
            <Text className="text-sm font-bold text-primary">
              {product?.name}
            </Text>
            <Text className="text-xs text-on-surface-variant font-mono">
              Código de barras: {product?.barcode}
            </Text>
            <Text className="text-xs text-on-surface-variant">
              Stock actual: {product?.stock} unidades
            </Text>
          </View>
          <Text className="text-xs text-error mt-1 leading-snug">
            El producto será removido del catálogo de la tienda y ya no podrá ser escaneado en terminales POS.
          </Text>
        </View>

        <View className="flex-row items-center justify-end gap-3 mt-4 pt-3 border-t border-surface-container-high/60">
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={mutation.isPending}
          />
          <Button
            label={mutation.isPending ? "Eliminando..." : "Sí, Eliminar"}
            variant="danger"
            rightIcon={
              <MaterialIcons name="delete" size={18} color="#ffffff" />
            }
            loading={mutation.isPending}
            disabled={mutation.isPending || !canDeleteProducts}
            onPress={() => mutation.mutate()}
          />
        </View>
      </View>
    </Modal>
  );
}
