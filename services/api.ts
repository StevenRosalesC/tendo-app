import { Platform } from "react-native";
import {
  AppRole,
  AuthenticatedUserProfile,
  GetUsersParams,
  ProductUnit,
  StoreData,
  UserListItem,
} from "../types/auth.types";

export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }
  return "http://localhost:8000/api";
};

export const getWsBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }
  return "http://localhost:8000";
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic authenticated fetch wrapper
 */
async function apiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token.trim()}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      responseData?.message ||
      (Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : null) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(errorMsg, response.status, responseData);
  }

  return responseData as T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface InventoryValuationData {
  totalProducts: number;
  totalUnitsInStock: number;
  totalInventoryCost: number;
  totalInventoryRetail: number;
  potentialProfit: number;
  criticalStockCount?: number;
  outOfStockCount?: number;
}

export interface SaleProductInfo {
  id: string;
  name: string;
  barcode: string | null;
}

export interface SaleItemRecord {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  priceAtSale: number;
  costPriceAtSale: number;
  product?: SaleProductInfo;
}

export interface SaleRecord {
  id: string;
  storeId: string;
  userId: string;
  total: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  items: SaleItemRecord[];
}

export interface GetSalesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export const tendoApi = {
  /**
   * Fetch current authenticated operator profile and permissions from NestJS
   */
  getProfile: (token: string) => {
    return apiRequest<AuthenticatedUserProfile>("/users/me", token, {
      method: "GET",
    });
  },

  /**
   * Fetch current tenant store details
   */
  getCurrentStore: (token: string) => {
    return apiRequest<StoreData>("/stores/current", token, {
      method: "GET",
    });
  },

  /**
   * Update current tenant store settings (name, default unit)
   */
  updateCurrentStore: (
    token: string,
    data: {
      name?: string;
      defaultUnit?: ProductUnit;
    },
  ) => {
    return apiRequest<StoreData>("/stores/current", token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch products catalog of the current store with pagination and filter support
   */
  getProducts: (
    token: string,
    params?: GetProductsParams,
  ) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (typeof params?.inStock === "boolean") {
      query.append("inStock", String(params.inStock));
    }
    if (typeof params?.lowStock === "boolean") {
      query.append("lowStock", String(params.lowStock));
    }
    const qs = query.toString();
    return apiRequest<PaginatedResponse<any>>(`/products${qs ? `?${qs}` : ""}`, token, {
      method: "GET",
    });
  },

  /**
   * Get store inventory valuation metrics (cost, retail, potential profit)
   */
  getInventoryValuation: (token: string) => {
    return apiRequest<InventoryValuationData>("/products/inventory/valuation", token, {
      method: "GET",
    });
  },

  /**
   * Get single product by ID
   */
  getProductById: (token: string, id: string) => {
    return apiRequest<any>(`/products/${id}`, token, {
      method: "GET",
    });
  },

  /**
   * Lookup product by barcode for POS rapid scanning
   */
  getProductByBarcode: (token: string, barcode: string) => {
    return apiRequest<any>(`/products/barcode/${encodeURIComponent(barcode)}`, token, {
      method: "GET",
    });
  },

  /**
   * Create a new product in store inventory
   */
  createProduct: (
    token: string,
    data: {
      name: string;
      price: number;
      costPrice?: number;
      barcode?: string;
      stock?: number;
      unit?: ProductUnit;
      trackStock?: boolean;
    },
  ) => {
    return apiRequest<any>("/products", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update full product information
   */
  updateProduct: (
    token: string,
    id: string,
    data: {
      name?: string;
      price?: number;
      costPrice?: number;
      barcode?: string;
      stock?: number;
      unit?: ProductUnit;
      trackStock?: boolean;
    },
  ) => {
    return apiRequest<any>(`/products/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update stock of a product (with live Socket.IO broadcast)
   */
  updateProductStock: (token: string, productId: string, stock: number) => {
    return apiRequest<any>(`/products/${productId}/stock`, token, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
  },

  /**
   * Delete a product from store inventory
   */
  deleteProduct: (token: string, productId: string) => {
    return apiRequest<any>(`/products/${productId}`, token, {
      method: "DELETE",
    });
  },

  /**
   * Process a POS sale checkout
   */
  createSale: (
    token: string,
    saleData: {
      items: { productId: string; quantity: number }[];
      discount?: number;
    },
  ) => {
    return apiRequest<SaleRecord>("/sales", token, {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },

  /**
   * List past sales history of the store with optional pagination and date filters
   */
  getSales: (token: string, params?: GetSalesParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.userId) query.append("userId", params.userId);
    const qs = query.toString();
    return apiRequest<PaginatedResponse<SaleRecord>>(`/sales${qs ? `?${qs}` : ""}`, token, {
      method: "GET",
    });
  },

  /**
   * Register push device token for current authenticated user and store
   */
  registerDeviceToken: (
    token: string,
    deviceToken: string,
    platform: "android" | "ios" | "web",
  ) => {
    return apiRequest<{ statusCode: number; message: string }>(
      "/notifications/devices",
      token,
      {
        method: "POST",
        body: JSON.stringify({
          token: deviceToken,
          platform,
        }),
      },
    );
  },

  /**
   * Unregister push device token when logging out
   */
  unregisterDeviceToken: (token: string, deviceToken: string) => {
    return apiRequest<void>(
      `/notifications/devices/${encodeURIComponent(deviceToken)}`,
      token,
      {
        method: "DELETE",
      },
    );
  },

  /**
   * List employees of the current store with optional pagination, role and search filters
   */
  getUsers: (token: string, params?: GetUsersParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.role) query.append("role", params.role);
    if (params?.search) query.append("search", params.search);
    const qs = query.toString();
    return apiRequest<PaginatedResponse<UserListItem>>(
      `/users${qs ? `?${qs}` : ""}`,
      token,
      {
        method: "GET",
      },
    );
  },

  /**
   * Update an employee's business role in the current store (Admin only)
   */
  updateUserRole: (token: string, userId: string, role: AppRole) => {
    return apiRequest<UserListItem>(`/users/${userId}/role`, token, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};

export default tendoApi;
