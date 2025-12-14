// context/SavedProductsContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useMemo,
} from "react";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog";

type SavedProductsContextValue = {
  savedIds: string[];
  savedProducts: Product[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
};

const SavedProductsContext = createContext<SavedProductsContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "clothinghub_saved_products";

export function SavedProductsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const allProducts = useMemo(() => getAllProducts(), []);
  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p] as const)),
    [allProducts]
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedIds(parsed.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist any changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  const savedProducts = useMemo(
    () =>
      savedIds
        .map((id) => productMap.get(id))
        .filter((p): p is Product => Boolean(p)),
    [productMap, savedIds]
  );

  useEffect(() => {
    const missingIds = savedIds.filter((id) => !productMap.has(id));
    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchMissing() {
      try {
        const res = await fetch("/api/catalog/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: missingIds }),
          signal: controller.signal,
        });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { products?: Product[] };
        if (cancelled || !data.products) return;

        data.products.forEach((product) => {
          productMap.set(product.id, product);
        });
      } catch {
        // ignore fetch errors
      }
    }

    fetchMissing();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [productMap, savedIds]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSaved = useCallback(() => {
    setSavedIds([]);
  }, []);

  const value: SavedProductsContextValue = {
    savedIds,
    savedProducts,
    isSaved,
    toggleSaved,
    clearSaved,
  };

  return (
    <SavedProductsContext.Provider value={value}>
      {children}
    </SavedProductsContext.Provider>
  );
}

export function useSavedProducts(): SavedProductsContextValue {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) {
    throw new Error("useSavedProducts must be used within a SavedProductsProvider");
  }
  return ctx;
}
