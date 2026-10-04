import { useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

interface Transaction {
  id: string;
  ticketNumber: string;
  category: "all" | "cards" | "cash" | "qr";
  paymentMethod: string;
  paymentLabel: string;
  timeAgo: string;
  productsSummary: string;
  amount: string;
  statusBadge: string;
  iconName: "credit-card" | "payments" | "qr-code-scanner" | "contactless";
  iconColor: string;
}

const LIVE_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    ticketNumber: "Venta #1042",
    category: "cards",
    paymentMethod: "Tarjeta Visa",
    paymentLabel: "Tarjeta Visa",
    timeAgo: "Hace 5 min",
    productsSummary: "2 productos (Café Espresso Doble, Croissant Almendras)",
    amount: "+$14.50",
    statusBadge: "Comprobante emitido",
    iconName: "credit-card",
    iconColor: "#c0c1ff",
  },
  {
    id: "tx-2",
    ticketNumber: "Venta #1041",
    category: "cash",
    paymentMethod: "Efectivo",
    paymentLabel: "Efectivo",
    timeAgo: "Hace 18 min",
    productsSummary: "4 productos (Set Gourmet Orgánico, Agua Mineral x2)",
    amount: "+$42.00",
    statusBadge: "Cambio $8.00 entregado",
    iconName: "payments",
    iconColor: "#c3c0ff",
  },
  {
    id: "tx-3",
    ticketNumber: "Venta #1040",
    category: "qr",
    paymentMethod: "Pago Digital QR",
    paymentLabel: "Pago Digital QR",
    timeAgo: "Hace 34 min",
    productsSummary: "1 producto (Auriculares Bluetooth Tendo)",
    amount: "+$8.75",
    statusBadge: "Aprobada",
    iconName: "qr-code-scanner",
    iconColor: "#c3c0ff",
  },
  {
    id: "tx-4",
    ticketNumber: "Venta #1039",
    category: "cards",
    paymentMethod: "Mastercard",
    paymentLabel: "Mastercard",
    timeAgo: "Hace 48 min",
    productsSummary: "3 productos (Bebida Energética, Sandwich Jamón)",
    amount: "+$22.30",
    statusBadge: "Comprobante emitido",
    iconName: "credit-card",
    iconColor: "#c0c1ff",
  },
  {
    id: "tx-5",
    ticketNumber: "Venta #1038",
    category: "cards",
    paymentMethod: "Tarjeta NFC",
    paymentLabel: "Tarjeta NFC",
    timeAgo: "Hace 1h 05m",
    productsSummary: "1 producto (Pack Cafetería Tendo Especial)",
    amount: "+$19.90",
    statusBadge: "Aprobada",
    iconName: "contactless",
    iconColor: "#c0c1ff",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [activeFilter, setActiveFilter] = useState<"all" | "cards" | "cash" | "qr">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const firstName = user?.firstName || "Carlos";

  const filteredTransactions = LIVE_TRANSACTIONS.filter((tx) => {
    if (activeFilter === "all") return true;
    return tx.category === activeFilter;
  });

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="p-4 sm:p-6 gap-5 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Welcome & Status Banner */}
      <View className="flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md relative overflow-hidden">
        <View className="flex-col gap-1.5 z-10">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Hola, {firstName} 👋
            </Text>
            <View className="px-2.5 py-0.5 rounded-full bg-surface-container-high border border-surface-container-highest/60">
              <Text className="text-xs font-bold text-primary">Caja #01</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            <MaterialIcons name="badge" size={15} color="#908fa0" />
            <Text className="text-xs text-on-surface-variant font-medium">
              Cajero
            </Text>
            <Text className="text-xs text-outline-variant">•</Text>
            <Text className="text-xs text-on-surface-variant font-medium">
              Caja Principal 01
            </Text>
            <Text className="text-xs text-outline-variant hidden sm:inline">•</Text>
            <Text className="text-xs text-on-surface font-semibold hidden sm:inline">
              Turno Matutino (Iniciado 08:30 AM)
            </Text>
          </View>
        </View>

        {/* Shift Actions & WebSocket Badge */}
        <View className="flex-row flex-wrap items-center gap-2.5 z-10">
          <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-inner">
            <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <Text className="text-xs font-semibold text-on-surface">
              WS Conectado
            </Text>
            <Text className="text-[11px] font-mono text-on-surface-variant hidden sm:inline">
              (18ms)
            </Text>
            <Text className="text-outline-variant">•</Text>
            <Text className="text-xs font-bold text-secondary">En línea</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className="h-10 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center gap-2"
          >
            <MaterialIcons name="calculate" size={18} color="#c0c1ff" />
            <Text className="text-xs font-bold text-on-surface">Arqueo Rápido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="h-10 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center gap-2"
          >
            <MaterialIcons name="pause-circle" size={18} color="#c3c0ff" />
            <Text className="text-xs font-bold text-on-surface">Pausar Turno</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 2: Operational Metrics Cards (Bento Stats) */}
      <View className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Ventas Turno */}
        <View className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-surface-container-high/80 justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Ventas Turno
            </Text>
            <View className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="point-of-sale" size={18} color="#c0c1ff" />
            </View>
          </View>

          <View className="mt-2 sm:mt-3">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl sm:text-3xl font-extrabold text-on-surface font-mono tracking-tight">
                $1,280.50
              </Text>
              <View className="px-1.5 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60 hidden sm:flex">
                <Text className="text-xs font-bold text-secondary">+18.4%</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5 mt-2">
              <MaterialIcons name="receipt-long" size={14} color="#c0c1ff" />
              <Text className="text-xs font-bold text-cyan-400">28 tickets</Text>
              <Text className="text-xs text-on-surface-variant">• Hoy</Text>
            </View>
          </View>

          <View className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <View className="bg-primary h-full w-[72%] rounded-full" />
          </View>
        </View>

        {/* Card 2: Método Top */}
        <View className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-surface-container-high/80 justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Método Top
            </Text>
            <View className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="contactless" size={18} color="#c0c1ff" />
            </View>
          </View>

          <View className="mt-2 sm:mt-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-base sm:text-lg font-bold text-on-surface">
                Tarjeta / NFC
              </Text>
              <Text className="text-base font-extrabold text-cyan-400 font-mono">
                68%
              </Text>
            </View>

            {/* Segmented Progress Bar */}
            <View className="w-full flex-row h-1.5 sm:h-2 rounded-full overflow-hidden mt-3 gap-0.5 bg-surface-container-highest">
              <View className="bg-primary h-full w-[45%]" />
              <View className="bg-secondary h-full w-[23%]" />
              <View className="bg-outline h-full w-[22%]" />
              <View className="bg-tertiary-container h-full w-[10%]" />
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-3 text-[10px] text-on-surface-variant">
            <Text className="text-[10px] text-on-surface-variant">Visa 45%</Text>
            <Text className="text-[10px] text-on-surface-variant">NFC 23%</Text>
            <Text className="text-[10px] text-on-surface-variant">Efec 22%</Text>
          </View>
        </View>

        {/* Card 3: Ticket Promedio (desktop / tablet) */}
        <View className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-surface-container-high/80 justify-between col-span-1 hidden lg:flex">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Ticket Promedio
            </Text>
            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="trending-up" size={18} color="#c3c0ff" />
            </View>
          </View>

          <View className="mt-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-3xl font-extrabold text-on-surface font-mono tracking-tight">
                $45.73
              </Text>
              <Svg width={80} height={28} viewBox="0 0 80 28" fill="none">
                <Path
                  d="M2 24 L14 18 L26 22 L38 12 L50 16 L62 6 L78 10"
                  stroke="#c0c1ff"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <View className="flex-row items-center gap-1.5 mt-2">
              <MaterialIcons name="shopping-basket" size={15} color="#908fa0" />
              <Text className="text-xs font-bold text-on-surface">
                2.4 artículos
              </Text>
              <Text className="text-xs text-on-surface-variant">por ticket</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-4 text-[11px] text-on-surface-variant">
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Mín: $8.75
            </Text>
            <Text className="text-[11px] text-on-surface-variant font-medium">
              Máx: $142.00
            </Text>
          </View>
        </View>

        {/* Card 4: Hardware & Caja (desktop / tablet) */}
        <View className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-surface-container-high/80 justify-between col-span-1 hidden lg:flex">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Hardware & Caja
            </Text>
            <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
              <MaterialIcons name="inventory" size={18} color="#c3c0ff" />
            </View>
          </View>

          <View className="mt-2 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant">Gaveta Efectivo:</Text>
              <Text className="text-xs font-bold font-mono text-on-surface">
                $450.00
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant">
                Impresora Térmica:
              </Text>
              <View className="flex-row items-center gap-1">
                <View className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <Text className="text-xs font-bold text-secondary">
                  92% papel
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-2.5 mt-2 bg-surface-container px-3 py-1.5 rounded-xl border border-surface-container-high/60">
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="verified" size={15} color="#c3c0ff" />
              <Text className="text-xs text-on-surface font-medium">
                Todos los sistemas
              </Text>
            </View>
            <Text className="text-xs font-extrabold text-secondary">OK</Text>
          </View>
        </View>
      </View>

      {/* Section 3: Primary Action & Quick Launch Hero Cards */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Hero: Iniciar Venta POS */}
        <View className="lg:col-span-7 bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-lg flex-col justify-between relative overflow-hidden">
          <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-primary/20">
                <MaterialIcons name="bolt" size={16} color="#c0c1ff" />
                <Text className="text-xs font-bold text-primary">
                  Acceso Primario de Mostrador
                </Text>
              </View>

              <View className="hidden sm:flex flex-row items-center gap-1 bg-surface-container-highest px-2.5 py-1 rounded-lg">
                <Text className="text-[11px] text-on-surface-variant">Atajo:</Text>
                <View className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-high">
                  <Text className="font-mono text-xs font-bold text-on-surface">F2</Text>
                </View>
                <Text className="text-[11px] text-on-surface-variant">o</Text>
                <View className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-high">
                  <Text className="font-mono text-xs font-bold text-on-surface">Espacio</Text>
                </View>
              </View>
            </View>

            <View className="mt-1">
              <Text className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Terminal POS - Nueva Venta
              </Text>
              <Text className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed max-w-xl">
                Apertura inmediata del carrito con interfaz táctil y lectura por
                código de barras. Listo para ingresar productos o escanear
                instantáneamente.
              </Text>
            </View>

            <View className="hidden sm:flex flex-row flex-wrap items-center gap-4 py-2 mt-1">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="barcode-reader" size={18} color="#c3c0ff" />
                <Text className="text-xs font-semibold text-on-surface">
                  Lector USB/Bluetooth activo
                </Text>
              </View>
              <View className="h-4 w-[1px] bg-surface-container-highest" />
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="dialpad" size={18} color="#c0c1ff" />
                <Text className="text-xs font-semibold text-on-surface">
                  Teclado numérico táctil
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-col sm:flex-row items-center gap-3 mt-5">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/terminal")}
              className="w-full sm:w-auto flex-1 h-12 px-6 rounded-xl bg-primary flex-row items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.99]"
            >
              <MaterialIcons
                name="shopping-cart-checkout"
                size={20}
                color="#1000a9"
              />
              <Text className="text-sm font-extrabold text-on-primary">
                Iniciar Nueva Venta
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="#1000a9" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              className="w-full sm:w-auto h-12 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="history" size={18} color="#c7c4d7" />
              <Text className="text-xs font-bold text-on-surface">
                Cobro Rápido Anterior
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Quick Card: Catálogo e Inventario */}
        <View className="lg:col-span-5 bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md flex-col justify-between">
          <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-surface-container-high items-center justify-center">
                  <MaterialIcons name="category" size={18} color="#c0c1ff" />
                </View>
                <Text className="text-base font-bold text-on-surface">
                  Catálogo & Stock Rápido
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-surface-container-high border border-surface-container-highest/60">
                <Text className="text-xs font-bold text-on-surface">
                  145 activos
                </Text>
              </View>
            </View>

            <Text className="text-xs text-on-surface-variant">
              Búsqueda directa para verificación de existencias en mostrador o
              ajustes exprés.
            </Text>

            {/* Search Bar Input */}
            <View className="relative mt-1">
              <View className="flex-row items-center bg-surface-container-highest rounded-xl px-3.5 h-11 border border-surface-container-high">
                <MaterialIcons name="barcode-reader" size={18} color="#908fa0" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Escanear SKU o escribir artículo..."
                  placeholderTextColor="#77767e"
                  className="flex-1 text-xs text-on-surface ml-2.5"
                />
                <View className="hidden sm:flex px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-high">
                  <Text className="font-mono text-[10px] text-on-surface-variant font-bold">
                    F4
                  </Text>
                </View>
              </View>
            </View>

            {/* Low Stock Notice */}
            <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-status-danger/30 mt-0.5">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="warning" size={18} color="#EF4444" />
                <Text className="text-xs text-on-surface font-medium">
                  3 artículos con bajo stock
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/inventory")}>
                <Text className="text-xs font-bold text-primary hover:underline">
                  Ver ítems
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="pt-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/inventory")}
              className="w-full h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="inventory-2" size={18} color="#c3c0ff" />
              <Text className="text-xs font-bold text-on-surface">
                Explorar Catálogo e Inventario
              </Text>
              <MaterialIcons name="chevron-right" size={16} color="#908fa0" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section 4: Split Operational Data Panels (7 / 5 cols) */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Panel: Transacciones en Vivo (7 cols on lg, full width on mobile) */}
        <View className="lg:col-span-7 bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md flex-col justify-between">
          <View>
            <View className="flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container-high/60">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="receipt" size={20} color="#c0c1ff" />
                <Text className="text-base font-bold text-on-surface">
                  Transacciones en Vivo
                </Text>
              </View>

              {/* Filter Tabs */}
              <View className="flex-row items-center gap-1 bg-surface-container-highest p-1 rounded-xl overflow-x-auto">
                {(
                  [
                    { key: "all", label: "Todas (28)" },
                    { key: "cards", label: "Tarjetas (19)" },
                    { key: "cash", label: "Efectivo (6)" },
                    { key: "qr", label: "QR (3)" },
                  ] as const
                ).map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    className={`px-2.5 py-1 rounded-lg ${
                      activeFilter === filter.key
                        ? "bg-surface-container-high border border-surface-container-highest"
                        : ""
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        activeFilter === filter.key
                          ? "text-on-surface font-bold"
                          : "text-on-surface-variant font-medium hover:text-on-surface"
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transactions List */}
            <View className="flex-col gap-2 mt-4">
              {filteredTransactions.map((tx) => (
                <View
                  key={tx.id}
                  className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/40"
                >
                  <View className="flex-row items-center gap-3 min-w-0 flex-1 mr-3">
                    <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center shrink-0">
                      <MaterialIcons
                        name={tx.iconName}
                        size={20}
                        color={tx.iconColor}
                      />
                    </View>
                    <View className="flex-col min-w-0 flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs font-bold text-on-surface font-mono">
                          {tx.ticketNumber}
                        </Text>
                        <Text className="text-outline-variant text-[10px]">
                          •
                        </Text>
                        <Text className="text-xs font-medium text-secondary">
                          {tx.paymentLabel}
                        </Text>
                        <Text className="text-outline-variant text-[10px]">
                          •
                        </Text>
                        <Text className="text-xs text-on-surface-variant">
                          {tx.timeAgo}
                        </Text>
                      </View>
                      <Text className="text-xs text-on-surface-variant truncate mt-0.5">
                        {tx.productsSummary}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end shrink-0">
                    <Text className="text-sm font-extrabold text-secondary font-mono">
                      {tx.amount}
                    </Text>
                    <Text className="text-[11px] text-on-surface-variant mt-0.5">
                      {tx.statusBadge}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Actions */}
          <View className="flex-row flex-wrap items-center justify-between pt-4 mt-4 border-t border-surface-container-high/60 gap-3">
            <TouchableOpacity
              onPress={() => router.push("/reports")}
              className="flex-row items-center gap-1.5"
            >
              <Text className="text-xs font-bold text-primary hover:underline">
                Ver todas las transacciones del turno
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#c0c1ff" />
            </TouchableOpacity>

            <TouchableOpacity className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest/60 flex-row items-center gap-2">
              <MaterialIcons name="print" size={15} color="#c7c4d7" />
              <Text className="text-xs font-medium text-on-surface">
                Reimprimir último ticket
              </Text>
              <View className="hidden sm:flex bg-surface-container px-1 py-0.5 rounded border border-surface-container-high">
                <Text className="font-mono text-[9px] text-on-surface-variant font-bold">
                  Shift + P
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Panel: Periféricos & Atajos de Teclado */}
        <View className="lg:col-span-5 flex-col gap-4 sm:gap-5">
          {/* Peripherals Health Card */}
          <View className="bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="devices" size={18} color="#c3c0ff" />
                <Text className="text-base font-bold text-on-surface">
                  Periféricos Conectados
                </Text>
              </View>
              <View className="w-2 h-2 rounded-full bg-secondary" />
            </View>

            <View className="flex-col gap-2.5">
              {/* Zebra Scanner */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-surface-container-high items-center justify-center">
                    <MaterialIcons
                      name="barcode-reader"
                      size={15}
                      color="#c0c1ff"
                    />
                  </View>
                  <View className="flex-col">
                    <Text className="text-xs font-bold text-on-surface">
                      Zebra DS2208
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">
                      Lector Código de Barras
                    </Text>
                  </View>
                </View>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                  <Text className="text-xs font-bold text-secondary">
                    USB HID
                  </Text>
                </View>
              </View>

              {/* Thermal Printer */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-surface-container-high items-center justify-center">
                    <MaterialIcons name="print" size={15} color="#22d3ee" />
                  </View>
                  <View className="flex-col">
                    <Text className="text-xs font-bold text-on-surface">
                      Epson TM-T88VI
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">
                      Impresora Térmica 80mm
                    </Text>
                  </View>
                </View>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                  <Text className="text-xs font-bold text-secondary">
                    Papel 92%
                  </Text>
                </View>
              </View>

              {/* Verifone Terminal */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-surface-container-high items-center justify-center">
                    <MaterialIcons
                      name="contactless"
                      size={15}
                      color="#c3c0ff"
                    />
                  </View>
                  <View className="flex-col">
                    <Text className="text-xs font-bold text-on-surface">
                      Verifone P400
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">
                      Terminal Cobro LAN
                    </Text>
                  </View>
                </View>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                  <Text className="text-xs font-bold text-primary">
                    NFC Activo
                  </Text>
                </View>
              </View>

              {/* Cash Drawer */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high/40">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-7 h-7 rounded-lg bg-surface-container-high items-center justify-center">
                    <MaterialIcons name="lock" size={15} color="#908fa0" />
                  </View>
                  <View className="flex-col">
                    <Text className="text-xs font-bold text-on-surface">
                      Gaveta de Seguridad
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">
                      Sensor de apertura RJ12
                    </Text>
                  </View>
                </View>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest/60">
                  <Text className="text-xs font-medium text-on-surface-variant">
                    Bloqueo Seguro
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Shortcuts Cheat Sheet */}
          <View className="bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high shadow-md gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="keyboard" size={18} color="#c0c1ff" />
                <Text className="text-base font-bold text-on-surface">
                  Atajos de Teclado Rápido
                </Text>
              </View>
              <Text className="text-xs text-on-surface-variant font-medium">
                Modo Cajero
              </Text>
            </View>

            <View className="grid grid-cols-2 gap-2 mt-1">
              <View className="p-3 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row items-center justify-between">
                <Text className="text-xs text-on-surface-variant">Nueva Venta</Text>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest">
                  <Text className="font-mono text-xs font-bold text-primary">
                    F2
                  </Text>
                </View>
              </View>

              <View className="p-3 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row items-center justify-between">
                <Text className="text-xs text-on-surface-variant">Buscar Ítem</Text>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest">
                  <Text className="font-mono text-xs font-bold text-primary">
                    F4
                  </Text>
                </View>
              </View>

              <View className="p-3 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row items-center justify-between">
                <Text className="text-xs text-on-surface-variant">Abrir Gaveta</Text>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest">
                  <Text className="font-mono text-xs font-bold text-primary">
                    F8
                  </Text>
                </View>
              </View>

              <View className="p-3 rounded-xl bg-surface-container border border-surface-container-high/40 flex-row items-center justify-between">
                <Text className="text-xs text-on-surface-variant">
                  Cancelar / Salir
                </Text>
                <View className="px-2 py-0.5 rounded bg-surface-container-high border border-surface-container-highest">
                  <Text className="font-mono text-xs font-bold text-status-danger">
                    ESC
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
