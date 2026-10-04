import { MaterialIcons } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { InventoryCategoryFilter } from "./types";

export interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBranch: string;
  onBranchChange?: (branch: string) => void;
  selectedStockCondition: string;
  onStockConditionChange?: (condition: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  categories: InventoryCategoryFilter[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function InventoryToolbar({
  searchQuery,
  onSearchChange,
  selectedBranch,
  selectedStockCondition,
  viewMode,
  onViewModeChange,
  categories,
  activeCategoryId,
  onSelectCategory,
}: InventoryToolbarProps) {
  return (
    <View className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex-col gap-4 shadow-sm">
      <View className="flex-col lg:flex-row items-stretch lg:items-center gap-4 justify-between">
        {/* Barcode / SKU High-Velocity Scanner Input */}
        <View className="relative flex-1 max-w-2xl flex-row items-center bg-surface-container-high rounded-lg px-3 h-11 border border-surface-container-highest/60 focus-within:border-primary">
          <MaterialIcons name="qr-code-scanner" size={20} color="#c7c4d7" />
          <TextInput
            id="pos-inventory-search"
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Escanear código de barras o buscar por SKU, nombre... [F4]"
            placeholderTextColor="#77767e"
            className="flex-1 text-sm text-on-surface ml-2.5 h-full"
          />
          <View className="flex-row items-center gap-1.5 ml-2">
            <View className="px-2 py-0.5 rounded bg-surface-container">
              <Text className="text-xs font-semibold text-on-surface-variant font-mono">
                F4
              </Text>
            </View>
            <View className="w-2 h-2 rounded-full bg-secondary" />
          </View>
        </View>

        {/* Controls: Branch, Stock condition and layout toggle */}
        <View className="flex-row items-center gap-2 flex-wrap justify-between lg:justify-end">
          {/* Branch Pill / Selector */}
          <View className="flex-row items-center gap-1.5 h-11 px-3 rounded-lg bg-surface-container-high border border-surface-container-highest/50">
            <MaterialIcons name="store" size={16} color="#c7c4d7" />
            <Text className="text-xs sm:text-sm font-medium text-on-surface">
              {selectedBranch}
            </Text>
            <MaterialIcons name="expand-more" size={18} color="#c7c4d7" />
          </View>

          {/* Stock Condition Filter */}
          <View className="flex-row items-center gap-1.5 h-11 px-3 rounded-lg bg-surface-container-high border border-surface-container-highest/50">
            <MaterialIcons name="filter-list" size={16} color="#c7c4d7" />
            <Text className="text-xs sm:text-sm font-medium text-on-surface">
              {selectedStockCondition}
            </Text>
            <MaterialIcons name="expand-more" size={18} color="#c7c4d7" />
          </View>

          {/* View Mode Toggle Buttons */}
          <View className="flex-row items-center p-1 rounded-lg bg-surface-container-high border border-surface-container-highest/50">
            <TouchableOpacity
              onPress={() => onViewModeChange("table")}
              className={`w-9 h-9 rounded items-center justify-center transition-colors ${
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
              className={`w-9 h-9 rounded items-center justify-center transition-colors ${
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

      {/* Fast Category Chips Filter Matrix */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-2 pb-1"
      >
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              className={`px-3.5 py-1.5 rounded-lg flex-row items-center gap-1.5 transition-colors ${
                isActive
                  ? "bg-primary shadow-sm"
                  : "bg-surface-container-high border border-surface-container-highest/40 hover:bg-surface-bright"
              }`}
            >
              {category.isWarning && (
                <View className="w-2 h-2 rounded-full bg-error" />
              )}
              <Text
                className={`text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? "text-on-primary"
                    : category.isWarning
                    ? "text-error"
                    : "text-on-surface-variant"
                }`}
              >
                {category.label} ({category.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
