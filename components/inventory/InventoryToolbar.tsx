import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inStock?: boolean;
  onInStockChange: (inStock?: boolean) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export default function InventoryToolbar({
  searchQuery,
  onSearchChange,
  inStock,
  onInStockChange,
  viewMode,
  onViewModeChange,
}: InventoryToolbarProps) {
  return (
    <View className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex-col gap-4 shadow-sm">
      <View className="flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        {/* Barcode / Name API Search Input */}
        <View className="relative flex-1 max-w-xl flex-row items-center bg-surface-container-high rounded-lg px-3 h-11 border border-surface-container-highest/60 focus-within:border-primary">
          <MaterialIcons name="qr-code-scanner" size={20} color="#c7c4d7" />
          <TextInput
            id="pos-inventory-search"
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Buscar por nombre o código de barras... [F4]"
            placeholderTextColor="#77767e"
            className="flex-1 text-sm text-on-surface ml-2.5 h-full"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange("")}
              className="p-1 mr-1 rounded-full hover:bg-surface-container-highest"
            >
              <MaterialIcons name="close" size={16} color="#c7c4d7" />
            </TouchableOpacity>
          )}
          <View className="flex-row items-center gap-1.5 ml-1">
            <View className="px-2 py-0.5 rounded bg-surface-container">
              <Text className="text-xs font-semibold text-on-surface-variant font-mono">
                F4
              </Text>
            </View>
          </View>
        </View>

        {/* API Supported Filters: inStock & Layout mode */}
        <View className="flex-row items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* inStock Filter Pills */}
          <View className="flex-row items-center p-1 rounded-lg bg-surface-container-high border border-surface-container-highest/50">
            <TouchableOpacity
              onPress={() => onInStockChange(undefined)}
              className={`px-3 py-1.5 rounded-md flex-row items-center gap-1.5 ${
                inStock === undefined
                  ? "bg-surface-container text-on-surface shadow-xs"
                  : "hover:bg-surface-container/60"
              }`}
            >
              <MaterialIcons
                name="inventory-2"
                size={16}
                color={inStock === undefined ? "#c0c1ff" : "#c7c4d7"}
              />
              <Text
                className={`text-xs font-semibold ${
                  inStock === undefined ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onInStockChange(true)}
              className={`px-3 py-1.5 rounded-md flex-row items-center gap-1.5 ${
                inStock === true
                  ? "bg-surface-container text-on-surface shadow-xs"
                  : "hover:bg-surface-container/60"
              }`}
            >
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text
                className={`text-xs font-semibold ${
                  inStock === true ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                En Stock
              </Text>
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle Buttons */}
          <View className="flex-row items-center p-1 rounded-lg bg-surface-container-high border border-surface-container-highest/50">
            <TouchableOpacity
              onPress={() => onViewModeChange("table")}
              className={`w-9 h-9 rounded items-center justify-center ${
                viewMode === "table"
                  ? "bg-surface-container text-on-surface shadow-xs"
                  : "hover:bg-surface-container/60"
              }`}
            >
              <MaterialIcons
                name="table-rows"
                size={20}
                color={viewMode === "table" ? "#c0c1ff" : "#c7c4d7"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onViewModeChange("grid")}
              className={`w-9 h-9 rounded items-center justify-center ${
                viewMode === "grid"
                  ? "bg-surface-container text-on-surface shadow-xs"
                  : "hover:bg-surface-container/60"
              }`}
            >
              <MaterialIcons
                name="grid-view"
                size={20}
                color={viewMode === "grid" ? "#c0c1ff" : "#c7c4d7"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
