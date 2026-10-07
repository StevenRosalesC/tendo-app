import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  onEditProduct: (id: string) => void;
  onMoreOptions: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function InventoryTable({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEditProduct,
  onMoreOptions,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
}: InventoryTableProps) {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  return (
    <View className="rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-sm overflow-hidden flex-col w-full">
      {/* Mobile Swipe Hint */}
      <View className="flex sm:hidden flex-row items-center justify-between px-3 py-1.5 bg-surface-container/70 border-b border-surface-container-high/40">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="swipe" size={14} color="#c0c1ff" />
          <Text className="text-[11px] text-on-surface-variant font-medium">
            Desliza horizontalmente para ver la tabla completa
          </Text>
        </View>
        <MaterialIcons name="arrow-forward" size={13} color="#908fa0" />
      </View>

      <Table
        minWidth={1080}
        className="w-full"
        containerClassName="border-0 rounded-none shadow-none bg-transparent w-full"
      >
        <TableHeader>
          <TableRow isHeader>
            <TableHead className="w-10">
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
            </TableHead>

            <TableHead className="flex-1 min-w-[280px]">Producto</TableHead>
            <TableHead className="w-28">Categoría</TableHead>
            <TableHead className="w-32" align="center">Stock Actual</TableHead>
            <TableHead className="w-32" align="right">Precio Venta</TableHead>
            <TableHead className="w-36" align="right">Costo / Margen</TableHead>
            <TableHead className="w-32" align="center">Estado</TableHead>
            <TableHead className="w-28" align="right">Acciones</TableHead>
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
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </View>
  );
}
