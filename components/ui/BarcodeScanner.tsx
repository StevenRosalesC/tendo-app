import { MaterialIcons } from "@expo/vector-icons";
import {
  BarcodeScanningResult,
  BarcodeType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Button from "./Button";
import Modal from "./Modal";

export const DEFAULT_BARCODE_TYPES: BarcodeType[] = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "qr",
];

export interface BarcodeScannerProps {
  /**
   * Callback fired when a barcode is successfully detected
   */
  onScan: (barcode: string, result: BarcodeScanningResult) => void;
  /**
   * Whether the scanner is actively listening for barcodes (default: true)
   */
  isActive?: boolean;
  /**
   * Milliseconds to pause scanner after a successful scan (default: 1500)
   */
  cooldownMs?: number;
  /**
   * Array of barcode symbologies to recognize (default: commercial EAN, UPC, Code128, QR)
   */
  barcodeTypes?: BarcodeType[];
  /**
   * Height of the viewfinder container in pixels (default: 320)
   */
  height?: number;
  /**
   * Whether to show the flashlight/torch toggle button (default: true)
   */
  showTorchToggle?: boolean;
  /**
   * Whether to show the camera facing switch button (default: false)
   */
  showFacingToggle?: boolean;
  /**
   * Whether to display the centering reticle and guide text (default: true)
   */
  showReticle?: boolean;
  /**
   * Guiding hint text displayed below the reticle
   */
  hintText?: string;
  /**
   * Custom container Tailwind class names
   */
  containerClassName?: string;
  /**
   * Custom container inline styles
   */
  containerStyle?: ViewStyle;
}

/**
 * Reusable camera viewfinder component for reading commercial barcodes and QR codes.
 * Handles permission validation, cooldown throttling, and visual feedback.
 */
export default function BarcodeScanner({
  onScan,
  isActive = true,
  cooldownMs = 1500,
  barcodeTypes = DEFAULT_BARCODE_TYPES,
  height = 320,
  showTorchToggle = true,
  showFacingToggle = false,
  showReticle = true,
  hintText = "Centra el código de barras aquí",
  containerClassName = "",
  containerStyle,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [isSuccess, setIsSuccess] = useState(false);
  const isCooldownRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (!isActive || isCooldownRef.current) return;

      isCooldownRef.current = true;
      setIsSuccess(true);

      // Trigger user callback
      onScan(result.data, result);

      // Reset success visual highlight after 400ms
      setTimeout(() => {
        setIsSuccess(false);
      }, 400);

      // Reset scanner lock after cooldown period
      setTimeout(() => {
        isCooldownRef.current = false;
      }, cooldownMs);
    },
    [isActive, cooldownMs, onScan],
  );

  // 1. Permissions Loading State
  if (!permission) {
    return (
      <View
        style={[{ height }, containerStyle]}
        className={`w-full rounded-2xl bg-surface-container border border-surface-container-high items-center justify-center gap-3 ${containerClassName}`}
      >
        <ActivityIndicator size="large" color="#c0c1ff" />
        <Text className="text-xs text-on-surface-variant font-medium">
          Inicializando sensor de cámara...
        </Text>
      </View>
    );
  }

  // 2. Permission Denied / Not Granted State
  if (!permission.granted) {
    return (
      <View
        style={[{ height }, containerStyle]}
        className={`w-full rounded-2xl bg-surface-container-low border border-surface-container-high p-6 items-center justify-center text-center gap-4 ${containerClassName}`}
      >
        <View className="w-12 h-12 rounded-xl bg-primary-container items-center justify-center">
          <MaterialIcons name="camera-alt" size={24} color="#0d0096" />
        </View>
        <View className="items-center">
          <Text className="text-base font-bold text-on-surface text-center">
            Permiso de Cámara Requerido
          </Text>
          <Text className="text-xs text-on-surface-variant text-center mt-1 max-w-xs">
            Concede acceso a la cámara para escanear artículos y códigos de barra.
          </Text>
        </View>
        <Button
          label="Permitir Cámara"
          size="sm"
          onPress={requestPermission}
          leftIcon={<MaterialIcons name="lock-open" size={16} color="#0d0096" />}
        />
      </View>
    );
  }

  // 3. Active Viewfinder
  return (
    <View
      style={[{ height }, containerStyle]}
      className={`w-full rounded-2xl overflow-hidden relative bg-black border-2 ${
        isSuccess ? "border-secondary" : "border-primary/80"
      } ${containerClassName}`}
    >
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes,
        }}
        onBarcodeScanned={isActive ? handleBarcodeScanned : undefined}
      />

      {/* Targeting Reticle & Overlay */}
      {showReticle && (
        <View className="absolute inset-0 items-center justify-center pointer-events-none p-4">
          <View
            className={`w-56 h-36 border-2 rounded-2xl ${
              isSuccess
                ? "border-secondary bg-secondary/20 scale-105"
                : "border-primary/90 bg-primary/10"
            }`}
          />
          <Text
            className={`text-xs font-semibold px-3 py-1 rounded-full mt-3 ${
              isSuccess
                ? "bg-secondary text-on-secondary font-bold"
                : "bg-black/75 text-white"
            }`}
          >
            {isSuccess ? "✓ ¡Código Detectado!" : hintText}
          </Text>
        </View>
      )}

      {/* Camera Utility Controls (Torch & Facing) */}
      <View className="absolute top-3 right-3 flex-row items-center gap-2">
        {showTorchToggle && (
          <TouchableOpacity
            onPress={() => setTorchEnabled((prev) => !prev)}
            activeOpacity={0.8}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              torchEnabled
                ? "bg-primary border-primary text-on-primary"
                : "bg-black/60 border-white/20"
            }`}
          >
            <MaterialIcons
              name={torchEnabled ? "flash-on" : "flash-off"}
              size={20}
              color={torchEnabled ? "#0d0096" : "#ffffff"}
            />
          </TouchableOpacity>
        )}

        {showFacingToggle && (
          <TouchableOpacity
            onPress={() =>
              setFacing((prev) => (prev === "back" ? "front" : "back"))
            }
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full items-center justify-center bg-black/60 border border-white/20"
          >
            <MaterialIcons name="flip-camera-android" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export interface BarcodeScannerModalProps {
  /**
   * Modal visibility
   */
  visible: boolean;
  /**
   * Callback fired when closing modal
   */
  onClose: () => void;
  /**
   * Callback fired when a barcode is detected
   */
  onScan: (barcode: string, result: BarcodeScanningResult) => void;
  /**
   * Modal Title
   */
  title?: string;
  /**
   * Modal Subtitle
   */
  subtitle?: string;
  /**
   * Whether to automatically close the modal upon scanning a code (default: true)
   */
  closeOnScan?: boolean;
  /**
   * Barcode symbologies
   */
  barcodeTypes?: BarcodeType[];
  /**
   * Cooldown between scans in ms (default: 1500)
   */
  cooldownMs?: number;
}

/**
 * Ready-to-use Modal dialog containing a barcode scanner.
 * Ideal for popping up from inputs, form fields, and search bars.
 */
export function BarcodeScannerModal({
  visible,
  onClose,
  onScan,
  title = "Escanear Código de Barras",
  subtitle = "Alinea la cámara con el código del producto",
  closeOnScan = true,
  barcodeTypes = DEFAULT_BARCODE_TYPES,
  cooldownMs = 1500,
}: BarcodeScannerModalProps) {
  const handleScan = useCallback(
    (barcode: string, result: BarcodeScanningResult) => {
      onScan(barcode, result);
      if (closeOnScan) {
        onClose();
      }
    },
    [closeOnScan, onClose, onScan],
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon="qr-code-scanner"
      maxWidth="md"
    >
      <View className="items-center gap-4">
        <BarcodeScanner
          onScan={handleScan}
          isActive={visible}
          cooldownMs={cooldownMs}
          barcodeTypes={barcodeTypes}
          height={300}
        />

        <View className="w-full flex-row items-center justify-end gap-3 mt-2">
          <Button
            label="Cancelar"
            variant="outline"
            onPress={onClose}
            className="flex-1 sm:flex-initial"
          />
        </View>
      </View>
    </Modal>
  );
}
