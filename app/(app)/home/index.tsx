import { useAuth, useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../../../components/Navigation";

interface Transaction {
  id: string;
  ticketNumber: string;
  itemsCount: number;
  paymentMethod: string;
  amount: string;
  timeAgo: string;
  iconName: "contactless" | "payments" | "qr-code-2";
  iconColor: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    ticketNumber: "Venta #1042",
    itemsCount: 2,
    paymentMethod: "Tarjeta Visa",
    amount: "+$14.50",
    timeAgo: "Hace 5 min",
    iconName: "contactless",
    iconColor: "#22d3ee", // cyan-400
  },
  {
    id: "tx-2",
    ticketNumber: "Venta #1041",
    itemsCount: 4,
    paymentMethod: "Efectivo",
    amount: "+$42.00",
    timeAgo: "Hace 18 min",
    iconName: "payments",
    iconColor: "#c3c0ff", // secondary
  },
  {
    id: "tx-3",
    ticketNumber: "Venta #1040",
    itemsCount: 1,
    paymentMethod: "Pago Digital",
    amount: "+$8.75",
    timeAgo: "Hace 34 min",
    iconName: "qr-code-2",
    iconColor: "#c0c1ff", // primary
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#c0c1ff" />
      </View>
    );
  }

  const operatorName = user?.firstName || "Carlos";
  const userInitial = operatorName.charAt(0).toUpperCase();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface">
      {/* Top Header */}
      <View className="w-full bg-surface-container-lowest/80 border-b border-surface-container-high/40 px-4 py-3">
        <View className="max-w-2xl mx-auto w-full flex-row items-center justify-between">
          {/* Left: WebSocket Live Status & Hub Title */}
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-cyan-400" />
              <Text className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                WS Live
              </Text>
            </View>

            <Text className="text-outline-variant font-medium">/</Text>

            <Text className="text-base font-bold text-on-surface">
              Inicio Hub
            </Text>
          </View>

          {/* Right: Station Info & Operator Avatar */}
          <View className="flex-row items-center gap-3">
            <View className="items-end">
              <Text className="text-xs font-bold text-on-surface leading-tight">
                Caja #04
              </Text>
              <Text className="text-[10px] text-on-surface-variant font-medium leading-tight">
                Turno Activo
              </Text>
            </View>

            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-sm">
              {user?.imageUrl ? (
                <Text className="text-xs font-bold text-on-primary">
                  {userInitial}
                </Text>
              ) : (
                <MaterialIcons name="person" size={18} color="#1000a9" />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-2xl mx-auto w-full px-4 pt-5 gap-5">
          {/* User Greeting & Online Indicator */}
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
                  Hola, {operatorName}
                </Text>
                <Text className="text-2xl">👋</Text>
              </View>
              <Text className="text-xs text-on-surface-variant mt-0.5">
                Cajero • Caja Principal 01
              </Text>
            </View>

            {/* WebSocket Online Badge */}
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 shrink-0">
              <View className="w-2 h-2 rounded-full bg-cyan-400" />
              <Text className="text-xs font-semibold text-cyan-300 tracking-wide">
                En línea
              </Text>
            </View>
          </View>

          {/* Quick Metrics (Bento Stats) */}
          <View className="flex-row gap-3">
            {/* Stat 1: Shift Sales */}
            <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/80 justify-between">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-medium text-on-surface-variant">
                  Ventas Turno
                </Text>
                <View className="w-7 h-7 rounded-full bg-surface-container-high items-center justify-center">
                  <MaterialIcons name="payments" size={16} color="#c0c1ff" />
                </View>
              </View>

              <View>
                <Text className="text-xl font-bold text-on-surface tracking-tight">
                  $1,280.50
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Text className="text-xs font-semibold text-cyan-400">
                    28 tickets
                  </Text>
                  <Text className="text-xs text-on-surface-variant">• Hoy</Text>
                </View>
              </View>
            </View>

            {/* Stat 2: Top Payment Method */}
            <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/80 justify-between">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-medium text-on-surface-variant">
                  Método Top
                </Text>
                <View className="w-7 h-7 rounded-full bg-surface-container-high items-center justify-center">
                  <MaterialIcons name="contactless" size={16} color="#c3c0ff" />
                </View>
              </View>

              <View>
                <Text className="text-xl font-bold text-on-surface tracking-tight">
                  Tarjeta / NFC
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-xs font-semibold text-cyan-400">
                    68%
                  </Text>
                  <View className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <View className="h-full bg-cyan-400 rounded-full w-[68%]" />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Main Action Cards */}
          <View className="gap-3">
            {/* Card 1: Fast Checkout Terminal (Hero Action) */}
            <View className="bg-surface-container-high/90 border border-primary/20 p-5 rounded-2xl shadow-xl">
              <View className="flex-row items-start justify-between mb-3">
                <View className="w-12 h-12 rounded-xl bg-primary-container items-center justify-center shadow-sm">
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={26}
                    color="#0d0096"
                  />
                </View>
                <View className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/25">
                  <Text className="text-xs font-bold text-primary">
                    Fast Checkout
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-lg font-bold text-on-surface">
                  Abrir Terminal
                </Text>
                <Text className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Escanear códigos y procesar cobro rápido sin fricción
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/terminal")}
                className="mt-4 w-full h-12 rounded-xl bg-primary-container flex-row items-center justify-center gap-2 shadow-md active:scale-[0.99]"
              >
                <Text className="text-sm font-bold text-on-primary-container">
                  Nueva Venta
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color="#0d0096" />
              </TouchableOpacity>
            </View>

            {/* Card 2: Inventory & Catalog Management */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/inventory")}
              className="bg-surface-container p-4 rounded-2xl border border-surface-container-high/80 active:bg-surface-container-high flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
                <View className="w-11 h-11 rounded-xl bg-surface-container-highest items-center justify-center shrink-0">
                  <MaterialIcons
                    name="inventory-2"
                    size={22}
                    color="#c3c0ff"
                  />
                </View>

                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-bold text-on-surface truncate">
                    Gestionar Inventario
                  </Text>
                  <Text className="text-xs text-on-surface-variant truncate mt-0.5">
                    Consulta de precios, existencias y alertas
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-1.5 shrink-0">
                <View className="px-2 py-0.5 rounded-full bg-surface-container-highest">
                  <Text className="text-[11px] font-semibold text-on-surface-variant">
                    145 activos
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#908fa0"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity Section */}
          <View className="gap-2.5">
            <View className="flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="schedule" size={18} color="#c7c4d7" />
                <Text className="text-sm font-bold text-on-surface">
                  Actividad Reciente
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/reports")}>
                <Text className="text-xs font-semibold text-primary">
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transactions List */}
            <View className="bg-surface-container-lowest p-2 rounded-2xl border border-surface-container-high/60 gap-1.5">
              {transactions.map((tx) => (
                <View
                  key={tx.id}
                  className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container"
                >
                  <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
                    <View className="w-10 h-10 rounded-xl bg-surface-container-high items-center justify-center shrink-0">
                      <MaterialIcons
                        name={tx.iconName}
                        size={20}
                        color={tx.iconColor}
                      />
                    </View>

                    <View className="flex-1 min-w-0">
                      <Text className="text-sm font-bold text-on-surface truncate">
                        {tx.ticketNumber}
                      </Text>
                      <Text className="text-xs text-on-surface-variant truncate mt-0.5">
                        {tx.itemsCount} productos • {tx.paymentMethod}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end shrink-0">
                    <Text className="text-sm font-black text-cyan-300">
                      {tx.amount}
                    </Text>
                    <Text className="text-[11px] text-on-surface-variant mt-0.5">
                      {tx.timeAgo}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Hardware Diagnostic Banner */}
          <View className="flex-row items-center justify-between p-3.5 bg-surface-container-low rounded-2xl border border-surface-container-high/80 px-4">
            <View className="flex-row items-center gap-2.5">
              <MaterialIcons name="print" size={18} color="#22d3ee" />
              <Text className="text-xs font-medium text-on-surface">
                Impresora térmica lista • Papel 92%
              </Text>
            </View>
            <View className="w-2 h-2 rounded-full bg-cyan-400" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Navigation */}
      <Navigation />
    </SafeAreaView>
  );
}
