import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CustomerInfo } from "./types";

export interface CartHeaderProps {
  ticketNumber: string;
  customer: CustomerInfo;
  totalItems: number;
  totalUnits: number;
  onCustomerPress?: () => void;
  onOpenScanner?: () => void;
  onOpenManualSelect?: () => void;
}

export default function CartHeader({
  ticketNumber,
  customer,
  totalItems,
  totalUnits,
  onCustomerPress,
  onOpenScanner,
  onOpenManualSelect,
}: CartHeaderProps) {
  return (
    <View className="flex-col gap-3 pb-3 border-b border-surface-container-high/60">
      {/* Top Row: Ticket Number & Quick Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-primary-container items-center justify-center">
            <MaterialIcons name="receipt-long" size={18} color="#0d0096" />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-bold text-on-surface">
                {ticketNumber}
              </Text>
              <View className="px-2 py-0.2 rounded-full bg-secondary/15">
                <Text className="text-[10px] font-bold text-secondary">
                  En Proceso
                </Text>
              </View>
            </View>
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Venta de Mostrador
            </Text>
          </View>
        </View>

        {/* Action icons: Manual Search & Camera Scanner */}
        <View className="flex-row items-center gap-1.5">
          {onOpenManualSelect && (
            <TouchableOpacity
              onPress={onOpenManualSelect}
              activeOpacity={0.7}
              className="h-8 px-2.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1.5 hover:bg-surface-bright"
            >
              <MaterialIcons name="search" size={16} color="#c0c1ff" />
              <Text className="text-xs font-semibold text-primary">
                Buscar
              </Text>
            </TouchableOpacity>
          )}

          {onOpenScanner && (
            <TouchableOpacity
              onPress={onOpenScanner}
              activeOpacity={0.7}
              className="h-8 px-2.5 rounded-lg bg-surface-container-high border border-surface-container-highest/60 flex-row items-center gap-1 hover:bg-surface-bright"
            >
              <MaterialIcons name="qr-code-scanner" size={16} color="#c0c1ff" />
              <Text className="text-xs font-semibold text-primary hidden sm:inline">
                Escanear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Row: Customer & Item counter pills */}
      <View className="flex-row items-center justify-between gap-2 flex-wrap pt-1">
        {/* Customer Selector Pill */}
        <TouchableOpacity
          onPress={onCustomerPress}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high border border-surface-container-highest/50"
        >
          <MaterialIcons name="person" size={15} color="#c0c1ff" />
          <Text className="text-xs font-medium text-on-surface">
            {customer.name}
          </Text>
          <MaterialIcons name="edit" size={12} color="#908fa0" />
        </TouchableOpacity>

        {/* Units badge */}
        <View className="px-2.5 py-1 rounded-xl bg-surface-container-high border border-surface-container-highest/30">
          <Text className="text-xs font-medium text-on-surface-variant font-mono">
            {totalItems} {totalItems === 1 ? "producto" : "productos"} •{" "}
            {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
          </Text>
        </View>
      </View>
    </View>
  );
}
