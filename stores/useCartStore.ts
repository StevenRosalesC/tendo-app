import { create } from "zustand";
import { CartItem, CartTotals, CustomerInfo } from "../components/terminal/types";

interface CartState {
  items: CartItem[];
  customer: CustomerInfo;
  globalDiscountPercent: number;
  taxRatePercent: number;
  ticketNumber: string;
  isDrawerOpen: boolean;

  // Actions
  addItem: (
    product: {
      id: string;
      name: string;
      price: number;
      barcode?: string;
      sku?: string;
      stock?: number;
      imageUrl?: string;
      category?: string;
    },
    quantity?: number,
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (customer: CustomerInfo) => void;
  setGlobalDiscountPercent: (percent: number) => void;
  setTaxRatePercent: (rate: number) => void;
  resetTicket: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Selectors / Calculations
  getTotals: () => CartTotals;
}

const DEFAULT_CUSTOMER: CustomerInfo = {
  name: "Público General",
  type: "regular",
};

const generateTicketId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `T-${randomNum}`;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: DEFAULT_CUSTOMER,
  globalDiscountPercent: 0,
  taxRatePercent: 16, // 16% IVA
  ticketNumber: "T-1042",
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  addItem: (product, quantityToAdd = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.id === product.id);

    if (existingIndex > -1) {
      const updated = [...items];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + quantityToAdd;

      // Check stock limit if provided
      if (typeof product.stock === "number" && newQty > product.stock) {
        updated[existingIndex] = {
          ...existing,
          quantity: product.stock,
        };
      } else {
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
        };
      }
      set({ items: updated });
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: Math.max(1, quantityToAdd),
        barcode: product.barcode || "",
        sku: product.sku,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === productId) {
          const max = typeof item.stock === "number" ? item.stock : Infinity;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      }),
    }));
  },

  incrementQuantity: (productId: string) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === productId) {
          const max = typeof item.stock === "number" ? item.stock : Infinity;
          if (item.quantity < max) {
            return { ...item, quantity: item.quantity + 1 };
          }
        }
        return item;
      }),
    }));
  },

  decrementQuantity: (productId: string) => {
    const { items, removeItem } = get();
    const target = items.find((i) => i.id === productId);
    if (!target) return;

    if (target.quantity <= 1) {
      removeItem(productId);
    } else {
      set({
        items: items.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        ),
      });
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  setGlobalDiscountPercent: (percent) => {
    set({ globalDiscountPercent: Math.max(0, Math.min(100, percent)) });
  },

  setTaxRatePercent: (rate) => {
    set({ taxRatePercent: Math.max(0, rate) });
  },

  resetTicket: () => {
    set({
      items: [],
      customer: DEFAULT_CUSTOMER,
      globalDiscountPercent: 0,
      ticketNumber: generateTicketId(),
    });
  },

  getTotals: () => {
    const { items, globalDiscountPercent, taxRatePercent } = get();

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const discountAmount = (subtotal * globalDiscountPercent) / 100;
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableBase * taxRatePercent) / 100;
    const total = taxableBase + taxAmount;

    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalItems = items.length;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
      totalUnits,
      totalItems,
    };
  },
}));

export default useCartStore;
