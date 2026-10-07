import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import tendoApi from "../../services/api";
import { ProductUnit } from "../../types/auth.types";
import useCurrentUser from "../../hooks/useCurrentUser";
import useAuthStore from "../../stores/useAuthStore";
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

const PRODUCT_UNITS: { value: ProductUnit; label: string; short: string }[] = [
  { value: "UNIT", label: "Unidad", short: "u" },
  { value: "KG", label: "Kilogramo", short: "kg" },
  { value: "LB", label: "Libra", short: "lb" },
  { value: "G", label: "Gramo", short: "g" },
  { value: "L", label: "Litro", short: "L" },
  { value: "ML", label: "Mililitro", short: "ml" },
  { value: "M", label: "Metro", short: "m" },
];

export default function ProductFormModal({
  visible,
  onClose,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const isManagerOrAdmin = useAuthStore((s) => s.isManager());

  const defaultStoreUnit: ProductUnit = user?.store?.defaultUnit || "UNIT";
  const isEditMode = !!productToEdit;

  // Form local state
  const [name, setName] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [unit, setUnit] = useState<ProductUnit>(defaultStoreUnit);
  const [trackStock, setTrackStock] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Sync form when productToEdit changes or modal visibility changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setBarcode(productToEdit.barcode || "");
      setPrice(String(productToEdit.price || ""));
      setCostPrice(
        productToEdit.costPrice !== undefined
          ? String(productToEdit.costPrice)
          : productToEdit.cost !== undefined
          ? String(productToEdit.cost)
          : "",
      );
      setStock(String(productToEdit.stock ?? "0"));
      setUnit(productToEdit.unit || defaultStoreUnit);
      setTrackStock(productToEdit.trackStock !== false);
    } else {
      setName("");
      setBarcode("");
      setPrice("");
      setCostPrice("");
      setStock("0");
      setUnit(defaultStoreUnit);
      setTrackStock(true);
    }
    setErrorMessage(null);
    setIsScannerOpen(false);
  }, [productToEdit, visible, defaultStoreUnit]);

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
      sum += parseInt(randomDigits[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    setBarcode(`${randomDigits}${checkDigit}`);
  };

  // Financial margin calculations
  const parsedPrice = parseFloat(price) || 0;
  const parsedCost = parseFloat(costPrice) || 0;
  const grossProfit = parsedPrice - parsedCost;
  const marginPercent =
    parsedPrice > 0 && parsedCost > 0
      ? ((parsedPrice - parsedCost) / parsedPrice) * 100
      : parsedCost === 0 && parsedPrice > 0
      ? 100
      : 0;

  const currentUnitObj =
    PRODUCT_UNITS.find((u) => u.value === unit) || PRODUCT_UNITS[0];

  // Mutation for Create / Update Product
  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No active Clerk session available");

      const numPrice = parseFloat(price);
      const numCost = costPrice.trim() ? parseFloat(costPrice) : undefined;
      const numStock = trackStock ? parseFloat(stock) : undefined;

      if (isNaN(numPrice) || numPrice <= 0) {
        throw new Error("El precio de venta debe ser un número mayor a 0.");
      }
      if (numCost !== undefined && (isNaN(numCost) || numCost < 0)) {
        throw new Error("El precio de compra debe ser un número mayor o igual a 0.");
      }
      if (trackStock && numStock !== undefined && (isNaN(numStock) || numStock < 0)) {
        throw new Error("El stock debe ser un número mayor o igual a 0.");
      }

      const payload = {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        price: numPrice,
        costPrice: numCost,
        stock: trackStock ? (numStock ?? 0) : undefined,
        unit,
        trackStock,
      };

      if (isEditMode && productToEdit) {
        return tendoApi.updateProduct(token, productToEdit.id, payload);
      } else {
        return tendoApi.createProduct(token, payload);
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
          ? `Actualizando datos para ${productToEdit?.name || "producto"}${
              productToEdit?.barcode ? ` (${productToEdit.barcode})` : " (Sin código)"
            }`
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
          placeholder="Ej. Manzanas Gala a granel o Coca Cola 600ml"
          autoCapitalize="words"
        />

        {/* Unit of Measurement Selector */}
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-on-surface-variant">
              Unidad de Medida
            </Text>
            <Text className="text-[11px] font-mono text-primary font-medium">
              {currentUnitObj.label} ({currentUnitObj.short})
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            className="flex-row py-1 -mx-1 px-1"
          >
            <View className="flex-row gap-2">
              {PRODUCT_UNITS.map((u) => {
                const isSelected = unit === u.value;
                return (
                  <TouchableOpacity
                    key={u.value}
                    onPress={() => setUnit(u.value)}
                    activeOpacity={0.7}
                    className={`px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-surface-container border-surface-container-high"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-[#0d0096] font-bold"
                          : "text-on-surface"
                      }`}
                    >
                      {u.label}
                    </Text>
                    <View
                      className={`px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-[#0d0096]/15"
                          : "bg-surface-container-highest"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-mono font-bold ${
                          isSelected ? "text-[#0d0096]" : "text-on-surface-variant"
                        }`}
                      >
                        {u.short}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Track Stock Toggle Card */}
        <View className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons
                name={trackStock ? "warehouse" : "all-inclusive"}
                size={16}
                color={trackStock ? "#c0c1ff" : "#ffd279"}
              />
              <Text className="text-xs font-bold text-on-surface">
                {trackStock
                  ? "Control de Inventario Activo"
                  : "Venta Libre / Sin Control de Stock"}
              </Text>
            </View>
            <Text className="text-[11px] text-on-surface-variant mt-0.5">
              {trackStock
                ? "Rastrea existencias físicas y descuenta stock automáticamente en cada venta."
                : "Ideal para productos a granel, servicios o inventario no controlado."}
            </Text>
          </View>
          <Switch
            value={trackStock}
            onValueChange={setTrackStock}
            trackColor={{ false: "#3b384e", true: "#65558f" }}
            thumbColor={trackStock ? "#c0c1ff" : "#908fa0"}
          />
        </View>

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
            label="Código de Barras (Opcional)"
            iconName="qr-code-scanner"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Opcional (EAN-13, SKU o dejar vacío)"
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
                    {isScannerOpen ? "Cerrar" : "Escanear"}
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
            Puedes dejarlo en blanco si es un artículo a granel sin etiqueta.
          </Text>
        </View>

        {/* Pricing Inputs Grid (Sale Price & Cost Price) */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input
              label="Precio de Venta ($) *"
              iconName="attach-money"
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          {isManagerOrAdmin && (
            <View className="flex-1">
              <Input
                label="Precio de Compra ($)"
                iconName="shopping-bag"
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          )}
        </View>

        {/* Profit Margin Telemetry Banner */}
        {parsedPrice > 0 && isManagerOrAdmin && (
          <View className="p-3 rounded-2xl bg-surface-container border border-surface-container-high/60 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  grossProfit < 0
                    ? "bg-error"
                    : marginPercent >= 25
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
              <View>
                <Text className="text-[11px] text-on-surface-variant">
                  Ganancia Bruta Estimada
                </Text>
                <Text
                  className={`text-xs font-bold font-mono ${
                    grossProfit < 0 ? "text-error" : "text-on-surface"
                  }`}
                >
                  {grossProfit >= 0
                    ? `+$${grossProfit.toFixed(2)}`
                    : `-$${Math.abs(grossProfit).toFixed(2)}`}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-[11px] text-on-surface-variant">
                Margen
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full mt-0.5 ${
                  grossProfit < 0
                    ? "bg-error/20"
                    : marginPercent >= 25
                    ? "bg-emerald-500/20"
                    : "bg-amber-500/20"
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    grossProfit < 0
                      ? "text-error"
                      : marginPercent >= 25
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {parsedCost > 0 ? `${marginPercent.toFixed(1)}%` : "100%"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Initial Stock Input (or unlimited note) */}
        {trackStock ? (
          <Input
            label={`Stock Inicial (${currentUnitObj.short})`}
            iconName="warehouse"
            value={stock}
            onChangeText={setStock}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        ) : (
          <View className="p-3 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest/40 flex-row items-center gap-2">
            <MaterialIcons name="all-inclusive" size={16} color="#c0c1ff" />
            <Text className="text-xs text-on-surface-variant flex-1">
              Inventario ilimitado: no se requiere definir stock inicial.
            </Text>
          </View>
        )}

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
