import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import InventoryPagination from "./InventoryPagination";
import InventoryTableRow from "./InventoryTableRow";
import { Product } from "./types";

export interface InventoryTableProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleAvailability: (id: string) => void;
  onQuickAddStock: (id: string) => void;
  onPrintBarcode: (id: string) => void;
  onEditProduct: (id: string) => void;
  onMoreOptions: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export default function InventoryTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleAvailability,
  onQuickAddStock,
  onPrintBarcode,
  onEditProduct,
  onMoreOptions,
  currentPage = 1,
  totalPages = 15,
  totalItems = 145,
}: InventoryTableProps) {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  return (
    <View className="rounded-xl bg-surface-container-low border border-surface-container-high/60 shadow-sm overflow-hidden flex-col w-full">
      <Table minWidth={1080}>
        <TableHeader>
          <TableRow isHeader>
            <View className="w-10">
              <TouchableOpacity
                onPress={onToggleSelectAll}
                className={`w-4 h-4 rounded border items-center justify-center ${
                  allSelected
                    ? "bg-primary border-primary"
                    : "bg-surface-container-high border-surface-container-highest"
                }`}
              >
                {allSelected && (
                  <MaterialIcons name="check" size={12} color="#1000a9" />
                )}
              </TouchableOpacity>
            </View>

            <TableHead className="flex-1 min-w-[280px]">Producto</TableHead>
            <TableHead className="w-28">Categoría</TableHead>
            <TableHead className="w-32" align="center">Stock Actual</TableHead>
            <TableHead className="w-36" align="right">Precio Venta</TableHead>
            <TableHead className="w-36" align="center">Canales Activos</TableHead>
            <TableHead className="w-24" align="center">Disponibilidad</TableHead>
            <TableHead className="w-40" align="right">Acciones Rápidas</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product, index) => (
            <InventoryTableRow
              key={product.id}
              product={product}
              isSelected={selectedIds.includes(product.id)}
              isAlternate={index % 2 === 1}
              onToggleSelect={onToggleSelect}
              onToggleAvailability={onToggleAvailability}
              onQuickAddStock={onQuickAddStock}
              onPrintBarcode={onPrintBarcode}
              onEditProduct={onEditProduct}
              onMoreOptions={onMoreOptions}
            />
          ))}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <InventoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={1}
        endItem={products.length}
      />
    </View>
  );
}
