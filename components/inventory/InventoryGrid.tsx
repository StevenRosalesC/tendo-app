import { View } from "react-native";
import InventoryGridItem from "./InventoryGridItem";
import InventoryPagination from "./InventoryPagination";
import { Product } from "./types";

export interface InventoryGridProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onQuickAddStock: (id: string) => void;
  onPrintBarcode: (id: string) => void;
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
  onToggleAvailability,
  onQuickAddStock,
  onPrintBarcode,
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
      <View className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <InventoryGridItem
            key={product.id}
            product={product}
            isSelected={selectedIds.includes(product.id)}
            onToggleSelect={onToggleSelect}
            onToggleAvailability={onToggleAvailability}
            onQuickAddStock={onQuickAddStock}
            onPrintBarcode={onPrintBarcode}
            onEditProduct={onEditProduct}
            onMoreOptions={onMoreOptions}
          />
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
