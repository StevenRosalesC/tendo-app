import { Platform } from "react-native";
import { AuthenticatedUserProfile } from "../types/auth.types";

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
    return apiRequest<any>("/stores/current", token, {
      method: "GET",
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
    const qs = query.toString();
    return apiRequest<PaginatedResponse<any>>(`/products${qs ? `?${qs}` : ""}`, token, {
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
    data: { name: string; barcode: string; price: number; stock?: number },
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
    data: { name?: string; barcode?: string; price?: number; stock?: number },
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
  createSale: (token: string, saleData: { items: { productId: string; quantity: number }[] }) => {
    return apiRequest<any>("/sales", token, {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },

  /**
   * List past sales history of the store
   */
  getSales: (token: string) => {
    return apiRequest<any[]>("/sales", token, {
      method: "GET",
    });
  },
};

export default tendoApi;
