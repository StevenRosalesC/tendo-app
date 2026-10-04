import { MaterialIcons } from "@expo/vector-icons";
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
  totalPages = 15,
  totalItems = 145,
  startItem = 1,
  endItem = 7,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
}: InventoryPaginationProps) {
  return (
    <View className="p-4 bg-surface-container rounded-b-xl flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container-high/40">
      {/* Information & Rows per page */}
      <View className="flex-row items-center gap-4 text-on-surface-variant flex-wrap">
        <Text className="text-xs text-on-surface-variant">
          Mostrando{" "}
          <Text className="text-on-surface font-bold">
            {startItem} - {endItem}
          </Text>{" "}
          de{" "}
          <Text className="text-on-surface font-bold">{totalItems}</Text>{" "}
          productos
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs text-on-surface-variant">Filas por página:</Text>
          <View className="h-8 px-2.5 rounded bg-surface-container-high items-center justify-center border border-surface-container-highest/40">
            <Text className="text-xs font-semibold text-on-surface">
              {rowsPerPage}
            </Text>
          </View>
        </View>
      </View>

      {/* Page Navigation Buttons */}
      <View className="flex-row items-center gap-1.5">
        <TouchableOpacity
          onPress={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`h-9 px-3 rounded-lg flex-row items-center gap-1 border border-surface-container-highest/40 ${
            currentPage <= 1
              ? "bg-surface-container-high/40 opacity-40"
              : "bg-surface-container-high hover:bg-surface-bright"
          }`}
        >
          <MaterialIcons name="chevron-left" size={16} color="#c7c4d7" />
          <Text className="text-xs font-medium text-on-surface">Anterior</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            className={`w-9 h-9 rounded-lg items-center justify-center ${
              currentPage === 1
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-high hover:bg-surface-bright"
            }`}
          >
            <Text
              className={`text-xs font-bold font-mono ${
                currentPage === 1 ? "text-on-primary" : "text-on-surface"
              }`}
            >
              1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-bright items-center justify-center">
            <Text className="text-xs font-semibold font-mono text-on-surface">
              2
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-bright items-center justify-center">
            <Text className="text-xs font-semibold font-mono text-on-surface">
              3
            </Text>
          </TouchableOpacity>

          <Text className="px-1 text-xs text-on-surface-variant">...</Text>

          <TouchableOpacity className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-bright items-center justify-center">
            <Text className="text-xs font-semibold font-mono text-on-surface">
              {totalPages}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`h-9 px-3 rounded-lg flex-row items-center gap-1 border border-surface-container-highest/40 ${
            currentPage >= totalPages
              ? "bg-surface-container-high/40 opacity-40"
              : "bg-surface-container-high hover:bg-surface-bright"
          }`}
        >
          <Text className="text-xs font-medium text-on-surface">Siguiente</Text>
          <MaterialIcons name="chevron-right" size={16} color="#c7c4d7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
