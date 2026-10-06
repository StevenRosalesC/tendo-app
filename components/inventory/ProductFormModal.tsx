import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tendoApi from "../../services/api";
import AlertBanner from "../ui/AlertBanner";
import BarcodeScanner from "../ui/BarcodeScanner";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { Product } from "./types";

export interface ProductFormModalProps {
  visible: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess?: (product: any) => void;
}

export default function ProductFormModal({
  visible,
  onClose,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const isEditMode = !!productToEdit;

  // Form local state
  const [name, setName] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Sync form when productToEdit changes or modal visibility changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setBarcode(productToEdit.barcode || "");
      setPrice(String(productToEdit.price || ""));
      setStock(String(productToEdit.stock ?? "0"));
    } else {
      setName("");
      setBarcode("");
      setPrice("");
      setStock("0");
    }
    setErrorMessage(null);
    setIsScannerOpen(false);
  }, [productToEdit, visible]);

  // Handle barcode captured from camera scanner
  const handleScanBarcode = (scannedBarcode: string) => {
    setBarcode(scannedBarcode.trim());
    setIsScannerOpen(false);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  // Generate random valid EAN-13 format barcode for quick tests
  const handleGenerateBarcode = () => {
    const randomDigits = Math.floor(
      100000000000 + Math.random() * 900000000000,
    ).toString();
    // Simple checksum calculation for EAN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(randomDigits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    setBarcode(`${randomDigits}${checkDigit}`);
  };

  // Mutation for Create / Update Product
  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No active Clerk session available");

      const numPrice = parseFloat(price);
      const numStock = parseInt(stock, 10);

      if (isNaN(numPrice) || numPrice <= 0) {
        throw new Error("El precio debe ser un número mayor a 0.");
      }
      if (isNaN(numStock) || numStock < 0) {
        throw new Error("El stock debe ser un número entero mayor o igual a 0.");
      }

      if (isEditMode && productToEdit) {
        return tendoApi.updateProduct(token, productToEdit.id, {
          name: name.trim(),
          barcode: barcode.trim(),
          price: numPrice,
          stock: numStock,
        });
      } else {
        return tendoApi.createProduct(token, {
          name: name.trim(),
          barcode: barcode.trim(),
          price: numPrice,
          stock: numStock,
        });
      }
    },
    onSuccess: (savedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(savedProduct);
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err?.message || "Ocurrió un error al guardar el producto.",
      );
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMessage("Por favor ingresa el nombre del producto.");
      return;
    }
    if (!barcode.trim()) {
      setErrorMessage("El código de barras es obligatorio.");
      return;
    }
    if (!price.trim()) {
      setErrorMessage("Por favor especifica el precio de venta.");
      return;
    }

    setErrorMessage(null);
    mutation.mutate();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEditMode ? "Editar Producto" : "Nuevo Producto"}
      subtitle={
        isEditMode
          ? `Actualizando datos para SKU / Código: ${productToEdit?.barcode}`
          : "Registra un nuevo artículo en el catálogo central de la tienda"
      }
      icon={isEditMode ? "edit" : "add-box"}
      maxWidth="md"
    >
      <View className="gap-4 pb-2">
        <AlertBanner message={errorMessage} />

        {/* Product Name */}
        <Input
          label="Nombre del Producto"
          iconName="inventory"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Coca Cola 600ml No Retornable"
          autoCapitalize="words"
        />

        {/* Inline Camera Barcode Scanner Viewfinder */}
        {isScannerOpen && (
          <View className="overflow-hidden rounded-2xl border border-primary/50 bg-surface-container-high shadow-lg">
            <View className="flex-row items-center justify-between p-3 bg-surface-container-highest/80 border-b border-surface-container-highest">
              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-md bg-primary/20 items-center justify-center">
                  <MaterialIcons name="qr-code-scanner" size={14} color="#c0c1ff" />
                </View>
                <Text className="text-xs font-bold text-on-surface">
                  Lector de Código de Barras Activo
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsScannerOpen(false)}
                activeOpacity={0.7}
                className="p-1 rounded-full bg-surface-container items-center justify-center"
              >
                <MaterialIcons name="close" size={16} color="#c7c4d7" />
              </TouchableOpacity>
            </View>

            <BarcodeScanner
              onScan={handleScanBarcode}
              isActive={isScannerOpen}
              height={220}
              cooldownMs={1000}
            />

            <View className="p-2.5 bg-surface-container-highest/60 items-center border-t border-surface-container-highest">
              <Text className="text-[11px] text-on-surface-variant text-center">
                Apunta al código para asignarlo automáticamente a este producto
              </Text>
            </View>
          </View>
        )}

        {/* Barcode & Actions (Scanner & Generator) */}
        <View className="gap-1.5">
          <Input
            label="Código de Barras (EAN / UPC / SKU)"
            iconName="qr-code-scanner"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="7501031311309"
            keyboardType="number-pad"
            rightElement={
              <TouchableOpacity
                onPress={() => setIsScannerOpen((prev) => !prev)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className={`p-1.5 rounded-lg border ${
                  isScannerOpen
                    ? "bg-primary border-primary"
                    : "bg-surface-container-high border-surface-container-highest active:bg-primary/20"
                }`}
              >
                <MaterialIcons
                  name="photo-camera"
                  size={16}
                  color={isScannerOpen ? "#0d0096" : "#c0c1ff"}
                />
              </TouchableOpacity>
            }
            rightLabel={
              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={() => setIsScannerOpen((prev) => !prev)}
                  activeOpacity={0.7}
                  className={`px-2.5 py-1 rounded-lg border flex-row items-center gap-1 ${
                    isScannerOpen
                      ? "bg-primary border-primary"
                      : "bg-primary/20 border-primary/40 active:bg-primary/30"
                  }`}
                >
                  <MaterialIcons
                    name={isScannerOpen ? "videocam-off" : "camera-alt"}
                    size={13}
                    color={isScannerOpen ? "#0d0096" : "#c0c1ff"}
                  />
                  <Text
                    className={`text-[11px] font-semibold ${
                      isScannerOpen ? "text-[#0d0096]" : "text-primary"
                    }`}
                  >
                    {isScannerOpen ? "Cerrar Cámara" : "Escanear"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGenerateBarcode}
                  activeOpacity={0.7}
                  className="bg-surface-container-high px-2.5 py-1 rounded-lg border border-surface-container-highest/60 flex-row items-center gap-1 active:bg-surface-container-highest"
                >
                  <MaterialIcons name="auto-fix-high" size={13} color="#c7c4d7" />
                  <Text className="text-[11px] font-semibold text-on-surface-variant">
                    Generar
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
          <Text className="text-[11px] text-on-surface-variant">
            Compatible con lectores láser USB/Bluetooth y la cámara del dispositivo.
          </Text>
        </View>

        {/* Price & Stock Grid */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input
              label="Precio de Venta ($ MXN)"
              iconName="attach-money"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View className="flex-1">
            <Input
              label="Stock Inicial"
              iconName="warehouse"
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-end gap-3 mt-4 pt-4 border-t border-surface-container-high/60">
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={mutation.isPending}
          />
          <Button
            label={
              mutation.isPending
                ? "Guardando..."
                : isEditMode
                ? "Actualizar Producto"
                : "Guardar Producto"
            }
            rightIcon={
              <MaterialIcons
                name={isEditMode ? "save" : "check"}
                size={18}
                color="#0d0096"
              />
            }
            loading={mutation.isPending}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}
