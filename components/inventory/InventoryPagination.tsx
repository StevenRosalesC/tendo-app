import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface InventoryPaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  startItem?: number;
  endItem?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function InventoryPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startItem,
  endItem,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
}: InventoryPaginationProps) {
  const safeStart =
    startItem ?? (totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1);
  const safeEnd = endItem ?? Math.min(currentPage * rowsPerPage, totalItems);
  const safeTotalPages = Math.max(1, totalPages);

  // Generate intelligent visible page numbers
  const getPageNumbers = (): (number | string)[] => {
    if (safeTotalPages <= 5) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", safeTotalPages];
    }
    if (currentPage >= safeTotalPages - 2) {
      return [1, "...", safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
    }
    return [1, "...", currentPage, "...", safeTotalPages];
  };

  const pages = getPageNumbers();

  return (
    <View className="p-3 sm:p-4 bg-surface-container rounded-b-xl flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-surface-container-high/40">
      {/* Information & Rows per page */}
      <View className="flex-row items-center justify-between sm:justify-start gap-3 sm:gap-4 text-on-surface-variant flex-wrap w-full sm:w-auto">
        <Text className="text-xs text-on-surface-variant">
          Mostrando{" "}
          <Text className="text-on-surface font-bold">
            {safeStart} - {safeEnd}
          </Text>{" "}
          de{" "}
          <Text className="text-on-surface font-bold">{totalItems}</Text>{" "}
          productos
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs text-on-surface-variant">Por página:</Text>
          <View className="h-7 sm:h-8 px-2 sm:px-2.5 rounded bg-surface-container-high items-center justify-center border border-surface-container-highest/40">
            <Text className="text-xs font-semibold text-on-surface font-mono">
              {rowsPerPage}
            </Text>
          </View>
        </View>
      </View>

      {/* Page Navigation Buttons */}
      <View className="flex-row items-center gap-1 sm:gap-1.5">
        <TouchableOpacity
          onPress={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          activeOpacity={0.7}
          style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
          accessibilityLabel="Página anterior"
          className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg flex-row items-center gap-1 border border-surface-container-highest/40 bg-surface-container-high"
        >
          <MaterialIcons name="chevron-left" size={16} color="#c7c4d7" />
          <Text className="text-xs font-medium text-on-surface hidden sm:inline">
            Anterior
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <Text
                  key={`ellipsis-${idx}`}
                  className="px-1 text-xs text-on-surface-variant font-mono"
                >
                  ...
                </Text>
              );
            }

            const pageNum = Number(p);
            const isCurrent = pageNum === currentPage;

            return (
              <TouchableOpacity
                key={`page-${pageNum}`}
                onPress={() => onPageChange?.(pageNum)}
                activeOpacity={0.7}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg items-center justify-center ${
                  isCurrent
                    ? "bg-primary"
                    : "bg-surface-container-high"
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    isCurrent ? "text-on-primary" : "text-on-surface"
                  }`}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          activeOpacity={0.7}
          style={{ opacity: currentPage >= safeTotalPages ? 0.4 : 1 }}
          accessibilityLabel="Página siguiente"
          className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg flex-row items-center gap-1 border border-surface-container-highest/40 bg-surface-container-high"
        >
          <Text className="text-xs font-medium text-on-surface hidden sm:inline">
            Siguiente
          </Text>
          <MaterialIcons name="chevron-right" size={16} color="#c7c4d7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
