import React from "react";
import { View } from "react-native";
import InventoryGridItem from "./InventoryGridItem";
import InventoryPagination from "./InventoryPagination";
import { Product } from "./types";

export interface InventoryGridProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEditProduct: (id: string) => void;
  onMoreOptions: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function InventoryGrid({
  products,
  selectedIds,
  onToggleSelect,
  onEditProduct,
  onMoreOptions,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
}: InventoryGridProps) {
  return (
    <View className="flex-col gap-4">
      <View className="flex-row flex-wrap -m-2">
        {products.map((product) => (
          <View key={product.id} className="w-full sm:w-1/2 md:w-1/3 xl:w-1/4 p-2">
            <InventoryGridItem
              product={product}
              isSelected={selectedIds.includes(product.id)}
              onToggleSelect={onToggleSelect}
              onEditProduct={onEditProduct}
              onMoreOptions={onMoreOptions}
            />
          </View>
        ))}
      </View>

      <View className="rounded-xl bg-surface-container-low border border-surface-container-high/60 overflow-hidden shadow-sm">
        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </View>
    </View>
  );
}
