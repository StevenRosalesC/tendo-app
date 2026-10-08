import { useAuth } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AlertBanner from "../ui/AlertBanner";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TendoLogo from "../ui/TendoLogo";
import tendoApi, { SaleRecord } from "../../services/api";
import useCartStore from "../../stores/useCartStore";

export type PaymentMethod = "CASH";

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckoutSuccess?: (sale: SaleRecord) => void;
}

export default function CheckoutModal({
  visible,
  onClose,
  onCheckoutSuccess,
}: CheckoutModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { items, customer, resetTicket, getTotals } = useCartStore();

  const totals = getTotals();
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);

  // Initialize received amount to total when modal opens or total changes
  useEffect(() => {
    if (visible && !completedSale) {
      setAmountReceived(totals.total.toFixed(2));
      setErrorMessage(null);
    }
  }, [visible, totals.total, completedSale]);

  const numReceived = parseFloat(amountReceived) || 0;
  const changeAmount = numReceived - totals.total;
  const isExactOrMore = changeAmount >= -0.01;

  // Quick denomination suggestions for cash
  const quickBills = useMemo(() => {
    const total = totals.total;
    const bills = [50, 100, 200, 500, 1000];
    const filtered = bills.filter((b) => b >= total);
    return filtered.length > 0 ? filtered.slice(0, 4) : [Math.ceil(total / 50) * 50];
  }, [totals.total]);

  const handleClose = () => {
    if (isSubmitting) return;
    if (completedSale) {
      // If user closes after sale succeeded, start fresh ticket
      resetTicket();
      setCompletedSale(null);
    }
    setErrorMessage(null);
    onClose();
  };

  const handleProcessSale = async () => {
    if (items.length === 0) return;
    if (numReceived < totals.total) {
      setErrorMessage("El monto en efectivo recibido no puede ser menor al total a cobrar.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const token = await getToken();
      if (!token) throw new Error("No se encontró una sesión activa.");

      const payload = {
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        discount:
          totals.discountAmount > 0
            ? Number(totals.discountAmount.toFixed(2))
            : undefined,
      };

      const sale = await tendoApi.createSale(token, payload);

      // Invalidate relevant queries so stock and sales reports update instantly
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-valuation"] });

      setCompletedSale(sale);
      onCheckoutSuccess?.(sale);
    } catch (err: any) {
      console.error("Error processing sale:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al procesar el cobro en el servidor."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSale = () => {
    resetTicket();
    setCompletedSale(null);
    setErrorMessage(null);
    onClose();
  };

  const handlePrintReceipt = () => {
    if (Platform.OS === "web") {
      window.print();
    }
  };

  const ticketCode =
    completedSale?.id?.slice(-6)?.toUpperCase() || "T-0000";

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={completedSale ? "Venta Cobrada" : "Cobro en Efectivo"}
      subtitle={
        completedSale
          ? `Comprobante de venta #${ticketCode}`
          : `${totals.totalItems} artículos (${totals.totalUnits} u.) · ${customer.name}`
      }
      icon={completedSale ? "check-circle" : "payments"}
      maxWidth="md"
    >
      {completedSale ? (
        /* --- SUCCESS RECEIPT VIEW --- */
        <View className="gap-5 py-2">
          {/* Success Banner Card */}
          <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 items-center justify-center gap-2">
            <View className="w-14 h-14 rounded-full bg-emerald-500/20 items-center justify-center">
              <MaterialIcons name="done" size={32} color="#34d399" />
            </View>
            <Text className="text-xl font-bold text-on-surface">
              ¡Cobro Exitoso!
            </Text>
            <Text className="text-xs text-on-surface-variant font-mono">
              Ticket #{ticketCode}
            </Text>
          </View>

          {/* Transaction Summary Card */}
          <View className="bg-surface-container-low rounded-2xl border border-surface-container-high p-4 gap-3">
            <View className="flex-row items-center justify-between pb-2 border-b border-surface-container-high/60">
              <TendoLogo variant="horizontal" size={18} wordmarkColor="#FFFFFF" />
              <Text className="text-[11px] font-mono text-on-surface-variant font-medium">
                Comprobante Oficial
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant font-medium">
                Total Pagado
              </Text>
              <Text className="text-xl font-black text-primary font-mono">
                ${totals.total.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant">
                Método de Pago
              </Text>
              <Badge
                label="Efectivo"
                variant="success"
                size="sm"
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant">
                Monto Recibido
              </Text>
              <Text className="text-sm font-semibold font-mono text-on-surface">
                ${numReceived.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-1 border-t border-surface-container-high/60">
              <Text className="text-xs font-bold text-emerald-400">
                Cambio a Entregar
              </Text>
              <Text className="text-base font-black font-mono text-emerald-400">
                ${Math.max(0, changeAmount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 pt-2">
            {Platform.OS === "web" && (
              <Button
                label="Imprimir Ticket"
                variant="secondary"
                className="flex-1"
                leftIcon={<MaterialIcons name="print" size={18} color="#c0c1ff" />}
                onPress={handlePrintReceipt}
              />
            )}

            <Button
              label="Nueva Venta"
              variant="primary"
              className="flex-1"
              leftIcon={<MaterialIcons name="add" size={18} color="#0d0096" />}
              onPress={handleNewSale}
            />
          </View>
        </View>
      ) : (
        /* --- CHECKOUT INPUT VIEW --- */
        <View className="gap-5">
          {errorMessage && (
            <AlertBanner type="error" message={errorMessage} />
          )}

          {/* Total Highlight Bar */}
          <View className="bg-surface-container-high/40 border border-surface-container-high rounded-2xl p-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Total a Cobrar
              </Text>
              <Text className="text-xs text-on-surface-variant mt-0.5">
                {totals.totalItems} artículos ({totals.totalUnits} u.)
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-3xl font-black text-primary font-mono">
                ${totals.total.toFixed(2)}
              </Text>
              {totals.discountAmount > 0 && (
                <Text className="text-[11px] text-secondary font-medium mt-0.5">
                  Descuento de -${totals.discountAmount.toFixed(2)} aplicado
                </Text>
              )}
            </View>
          </View>

          {/* Cash Amount & Change Calculation */}
          <View className="gap-3 bg-surface-container-low border border-surface-container-high/60 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Efectivo Recibido
              </Text>
              <TouchableOpacity
                onPress={() => setAmountReceived(totals.total.toFixed(2))}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-surface-container-highest/60 hover:bg-surface-container"
              >
                <Text className="text-[11px] font-semibold text-primary">
                  Monto Exacto
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount input field */}
            <View className="flex-row items-center bg-surface-container rounded-xl px-3.5 h-12 border border-surface-container-high">
              <Text className="text-lg font-bold font-mono text-primary mr-1">
                $
              </Text>
              <TextInput
                value={amountReceived}
                onChangeText={setAmountReceived}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#77767e"
                className="flex-1 text-xl font-bold font-mono text-on-surface h-full"
                editable={!isSubmitting}
                selectTextOnFocus
              />
            </View>

            {/* Quick Bill Pills */}
            <View className="flex-row items-center gap-2 flex-wrap">
              {quickBills.map((bill) => (
                <TouchableOpacity
                  key={bill}
                  onPress={() => setAmountReceived(bill.toString())}
                  className="px-3 py-1.5 rounded-xl bg-surface-container border border-surface-container-high hover:bg-surface-container-highest"
                >
                  <Text className="text-xs font-mono font-semibold text-on-surface">
                    ${bill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Change Feedback Banner */}
            <View
              className={`p-3 rounded-xl border flex-row items-center justify-between ${
                changeAmount >= 0
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}
            >
              <View className="flex-row items-center gap-2">
                <MaterialIcons
                  name={changeAmount >= 0 ? "change-circle" : "warning"}
                  size={18}
                  color={changeAmount >= 0 ? "#34d399" : "#fbbf24"}
                />
                <Text
                  className={`text-xs font-bold ${
                    changeAmount >= 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {changeAmount >= 0 ? "Cambio a entregar:" : "Falta por cobrar:"}
                </Text>
              </View>

              <Text
                className={`text-lg font-black font-mono ${
                  changeAmount >= 0 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                ${Math.abs(changeAmount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View className="flex-row items-center justify-end gap-3 pt-2">
            <Button
              label="Cancelar"
              variant="ghost"
              disabled={isSubmitting}
              onPress={handleClose}
            />

            <Button
              label={
                isSubmitting
                  ? "Cobrando..."
                  : `Cobrar $${totals.total.toFixed(2)} en Efectivo`
              }
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting || !isExactOrMore}
              onPress={handleProcessSale}
              leftIcon={
                !isSubmitting ? (
                  <MaterialIcons name="check" size={20} color="#0d0096" />
                ) : undefined
              }
            />
          </View>
        </View>
      )}
    </Modal>
  );
}
