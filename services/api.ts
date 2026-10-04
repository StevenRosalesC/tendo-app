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
   * Fetch products catalog of the current store
   */
  getProducts: (token: string) => {
    return apiRequest<any[]>("/products", token, {
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
   * Update stock of a product
   */
  updateProductStock: (token: string, productId: string, stock: number) => {
    return apiRequest<any>(`/products/${productId}/stock`, token, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
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
