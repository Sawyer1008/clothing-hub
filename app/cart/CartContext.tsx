"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog";

export type CartItem = {
  product: Product;
  quantity: number;
};

type StoredCartItem = {
  productId: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "clothing-hub-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<StoredCartItem[]>([]);
  const allProducts = useMemo(() => getAllProducts(), []);
  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p] as const)),
    [allProducts]
  );

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) return;

      const normalized: StoredCartItem[] = parsed
        .map((item: unknown) => {
          if (!item || typeof item !== "object") return null;
          const maybe = item as { productId?: unknown; quantity?: unknown; product?: unknown };

          if (
            typeof maybe.productId === "string" &&
            typeof maybe.quantity === "number"
          ) {
            return {
              productId: maybe.productId,
              quantity: Math.max(1, Math.floor(maybe.quantity)),
            };
          }

          if (
            maybe.product &&
            typeof maybe.product === "object" &&
            (maybe.product as Product).id &&
            typeof (maybe.product as Product).id === "string" &&
            typeof maybe.quantity === "number"
          ) {
            return {
              productId: (maybe.product as Product).id,
              quantity: Math.max(1, Math.floor(maybe.quantity)),
            };
          }

          return null;
        })
        .filter((item): item is StoredCartItem => Boolean(item));

      setCartItems(normalized);
    } catch (err) {
      console.error("Failed to load cart from storage", err);
    }
  }, []);


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to storage", err);
    }
  }, [cartItems]);

  const cart = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = productMap.get(item.productId);
          if (!product) return null;
          return { product, quantity: item.quantity };
        })
        .filter((item): item is CartItem => Boolean(item)),
    [cartItems, productMap]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    const nextQuantity = Math.max(1, Math.floor(quantity));
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
