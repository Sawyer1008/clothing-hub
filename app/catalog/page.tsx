"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import type { SearchFilters } from "@/types/search";
import { getAllProducts } from "@/lib/catalog/catalog";
import ProductCard from "@/components/ProductCard";

const allProducts: Product[] = getAllProducts();
const PAGE_SIZE = 12;
const STORAGE_KEY = "catalogState-v2";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "best-deals";

type StoredCatalogState = {
  query: string;
  selectedBrands: string[];
  selectedCategories: string[];
  selectedColors: string[];
  onSaleOnly: boolean;
  sortOption: SortOption;
  currentPage: number;
  productIds: string[];
  appliedFilters: SearchFilters | null;
};

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(allProducts);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(null);
  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p] as const)),
    []
  );

  // Build the filter lists once
  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const brand = p.brand?.trim();
      if (!brand) return;
      const key = brand.toLowerCase();
      if (!map.has(key)) {
        map.set(key, brand);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const category = p.category?.trim();
      if (!category) return;
      const key = category.toLowerCase();
      if (!map.has(key)) {
        map.set(key, category);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const colorOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      (p.colors || []).forEach((color) => {
        const trimmed = color?.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (!map.has(key)) {
          map.set(key, trimmed);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const resetCatalog = () => {
    setQuery("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setOnSaleOnly(false);
    setSortOption("featured");
    setCurrentPage(1);
    setProducts(allProducts);
    setAppliedFilters(null);
    setError(null);
    setIsLoading(false);
  };

  // Apply filters + search + sort
  const filteredProducts = useMemo(() => {
    const brandSet = new Set(selectedBrands.map((b) => b.toLowerCase()));
    const categorySet = new Set(selectedCategories.map((c) => c.toLowerCase()));
    const colorSet = new Set(selectedColors.map((c) => c.toLowerCase()));
    const hasActiveQuery = Boolean(appliedFilters?.text?.trim() || query.trim());

    const priceValue = (product: Product) => product.price?.amount ?? 0;
    const updatedAt = (product: Product) =>
      product.lastUpdated ? new Date(product.lastUpdated).getTime() : 0;

    const items = products.filter((p) => {
      if (brandSet.size && !brandSet.has(p.brand.toLowerCase())) return false;
      if (categorySet.size && !categorySet.has(p.category.toLowerCase())) return false;

      if (colorSet.size) {
        const colors = (p.colors || []).map((c) => c.toLowerCase());
        if (!colors.some((c) => colorSet.has(c))) return false;
      }

      if (onSaleOnly) {
        const original = p.price.originalAmount;
        if (!original || original <= p.price.amount) return false;
      }

      return true;
    });

    const sorted = [...items];
    const discountPercent = (product: Product) => {
      const original = product.price.originalAmount;
      if (!original || original <= 0) return 0;
      return ((original - product.price.amount) / original) * 100;
    };
    const discountAmount = (product: Product) => {
      const original = product.price.originalAmount;
      if (!original) return 0;
      return original - product.price.amount;
    };

    if (sortOption === "featured" && !hasActiveQuery) {
      sorted.sort((a, b) => {
        const popA = a.popularityScore ?? 0;
        const popB = b.popularityScore ?? 0;
        if (popB !== popA) return popB - popA;
        return priceValue(a) - priceValue(b);
      });
    } else if (sortOption === "price-asc") {
      sorted.sort((a, b) => priceValue(a) - priceValue(b));
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => priceValue(b) - priceValue(a));
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => updatedAt(b) - updatedAt(a));
    } else if (sortOption === "best-deals") {
      sorted.sort((a, b) => {
        const hasDiscountA = discountAmount(a) > 0;
        const hasDiscountB = discountAmount(b) > 0;
        if (hasDiscountA !== hasDiscountB) return hasDiscountB ? 1 : -1;

        const percentDiff = discountPercent(b) - discountPercent(a);
        if (percentDiff !== 0) return percentDiff;

        const amountDiff = discountAmount(b) - discountAmount(a);
        if (amountDiff !== 0) return amountDiff;

        const popA = a.popularityScore ?? 0;
        const popB = b.popularityScore ?? 0;
        if (popB !== popA) return popB - popA;

        return priceValue(a) - priceValue(b);
      });
    } else {
      // "featured" keeps the original order coming from search/ingestion
    }

    return sorted;
  }, [
    products,
    selectedBrands,
    selectedCategories,
    selectedColors,
    onSaleOnly,
    sortOption,
    appliedFilters,
    query,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE)),
    [filteredProducts]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const interpretedSummary = useMemo(() => {
    if (!appliedFilters) return "";
    const parts: string[] = [];
    if (appliedFilters.categories?.length) {
      parts.push(`categories: ${appliedFilters.categories.join(", ")}`);
    }
    if (appliedFilters.subcategories?.length) {
      parts.push(`subcategories: ${appliedFilters.subcategories.join(", ")}`);
    }
    if (appliedFilters.colors?.length) {
      parts.push(`colors: ${appliedFilters.colors.join(", ")}`);
    }
    if (appliedFilters.fits?.length) {
      parts.push(`fits: ${appliedFilters.fits.join(", ")}`);
    }
    if (appliedFilters.styles?.length) {
      parts.push(`styles: ${appliedFilters.styles.join(", ")}`);
    }
    if (appliedFilters.genders?.length) {
      parts.push(`genders: ${appliedFilters.genders.join(", ")}`);
    }
    if (appliedFilters.tagsInclude?.length) {
      parts.push(`tags: ${appliedFilters.tagsInclude.join(", ")}`);
    }
    if (appliedFilters.priceRange) {
      const { min, max } = appliedFilters.priceRange;
      if (min !== undefined && max !== undefined) {
        parts.push(`price: $${min} to $${max}`);
      } else if (min !== undefined) {
        parts.push(`price: >= $${min}`);
      } else if (max !== undefined) {
        parts.push(`price: <= $${max}`);
      }
    }
    if (appliedFilters.onSale) {
      parts.push("on sale");
    }
    return parts.join(" · ");
  }, [appliedFilters]);

  // hydrate persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<StoredCatalogState>;
      if (parsed.query) setQuery(parsed.query);
      if (parsed.selectedBrands) setSelectedBrands(parsed.selectedBrands);
      if (parsed.selectedCategories) setSelectedCategories(parsed.selectedCategories);
      if (parsed.selectedColors) setSelectedColors(parsed.selectedColors);
      if (typeof parsed.onSaleOnly === "boolean") setOnSaleOnly(parsed.onSaleOnly);
      if (
        parsed.sortOption &&
        (parsed.sortOption === "featured" ||
          parsed.sortOption === "price-asc" ||
          parsed.sortOption === "price-desc" ||
          parsed.sortOption === "newest" ||
          parsed.sortOption === "best-deals")
      ) {
        setSortOption(parsed.sortOption);
      }
      if (typeof parsed.currentPage === "number" && parsed.currentPage > 0) {
        setCurrentPage(parsed.currentPage);
      }
      if (parsed.appliedFilters) {
        setAppliedFilters(parsed.appliedFilters);
      }
      if (parsed.productIds) {
        const restored = parsed.productIds
          .map((id) => productMap.get(id))
          .filter(Boolean) as Product[];
        if (parsed.productIds.length === 0) {
          setProducts([]);
        } else if (restored.length > 0) {
          setProducts(restored);
        }
      }
    } catch (err) {
      console.error("Failed to load catalog state", err);
    }
  }, [productMap]);

  // persist state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: StoredCatalogState = {
      query,
      selectedBrands,
      selectedCategories,
      selectedColors,
      onSaleOnly,
      sortOption,
      currentPage,
      productIds: products.map((p) => p.id),
      appliedFilters,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    query,
    selectedBrands,
    selectedCategories,
    selectedColors,
    onSaleOnly,
    sortOption,
    currentPage,
    products,
    appliedFilters,
  ]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setProducts(allProducts);
      setAppliedFilters(null);
      setError(null);
      setCurrentPage(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed, maxResults: 60 }),
      });

      if (!res.ok) {
        throw new Error("Search failed");
      }

      const data = (await res.json()) as { products: Product[]; filters?: SearchFilters };
      setProducts(data.products || []);
      setAppliedFilters(data.filters ?? null);
      setCurrentPage(1);
    } catch (err) {
      console.error("Search error", err);
      setError("Something went wrong searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // helpers to toggle filters
  const toggleInArray = (current: string[], value: string): string[] => {
    return current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
  };

  // Apply pagination after filtering
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const paginationItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 1) return [];

    const items: number[] = [];
    const windowSize = 1;

    const addPage = (p: number) => {
      if (p >= 1 && p <= totalPages && !items.includes(p)) {
        items.push(p);
      }
    };

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p += 1) addPage(p);
    } else {
      addPage(1);
      addPage(totalPages);
      addPage(currentPage);
      for (let offset = 1; offset <= windowSize; offset += 1) {
        addPage(currentPage - offset);
        addPage(currentPage + offset);
      }
    }

    items.sort((a, b) => a - b);

    const finalItems: (number | "ellipsis")[] = [];
    let prevPage: number | null = null;

    for (const page of items) {
      if (prevPage !== null && page - prevPage > 1) {
        finalItems.push("ellipsis");
      }
      finalItems.push(page);
      prevPage = page;
    }

    return finalItems;
  }, [currentPage, totalPages]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 fade-in-up">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-20 space-y-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="space-y-1">
              <h1 className="text-sm font-semibold tracking-tight">
                Filters
              </h1>
              <p className="text-[11px] text-slate-400">
                Basic layout only. Agents will later plug in more advanced
                logic, sizes, and personalization.
              </p>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Search
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                    setError(null);
                  }}
                  placeholder="Search products or natural language"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Search"}
                </button>
              </form>
              {isLoading ? (
                <p className="text-[11px] text-slate-400">Searching...</p>
              ) : null}
              {error ? (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-50">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={resetCatalog}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-900 transition hover:bg-white"
                  >
                    Reset search &amp; filters
                  </button>
                </div>
              ) : null}
              {interpretedSummary ? (
                <p className="text-[11px] text-slate-400">Interpreted: {interpretedSummary}</p>
              ) : null}
            </div>

            {/* Brand filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Brand
                </label>
              </div>
              <div className="max-h-40 space-y-1 overflow-auto pr-1 text-xs">
                {brandOptions.map((brand) => {
                  const checked = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex cursor-pointer items-center gap-2 text-slate-200"
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-600 bg-slate-950"
                        checked={checked}
                        onChange={() => {
                          setSelectedBrands((prev) => toggleInArray(prev, brand));
                          setCurrentPage(1);
                        }}
                      />
                      <span>{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Category
              </label>
              <div className="space-y-1 text-xs">
                {categoryOptions.map((cat) => {
                  const checked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex cursor-pointer items-center gap-2 text-slate-200"
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-600 bg-slate-950"
                        checked={checked}
                        onChange={() => {
                          setSelectedCategories((prev) => toggleInArray(prev, cat));
                          setCurrentPage(1);
                        }}
                      />
                      <span className="capitalize">{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Color filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Color
              </label>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {colorOptions.map((color) => {
                  const value = color.toLowerCase();
                  const active = selectedColors.includes(value);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColors((prev) => toggleInArray(prev, value));
                        setCurrentPage(1);
                      }}
                      className={`rounded-full border px-2 py-0.5 ${
                        active
                          ? "border-slate-100 bg-slate-100 text-slate-950"
                          : "border-slate-600 bg-slate-950 text-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deals filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Deals
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-600 bg-slate-950"
                  checked={onSaleOnly}
                  onChange={() => {
                    setOnSaleOnly((prev) => !prev);
                    setCurrentPage(1);
                  }}
                />
                <span>On sale</span>
              </label>
            </div>

            {/* Placeholder for future size / price filters */}
            <div className="space-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
              <p>Size, price range, and more advanced filters will plug in here later.</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 space-y-4">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
              <p className="text-xs text-slate-400">
                {filteredProducts.length} items
                {query.trim()
                  ? ` · matching “${query.trim()}”`
                  : selectedBrands.length ||
                    selectedCategories.length ||
                    selectedColors.length ||
                    onSaleOnly
                  ? " · filtered"
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Sort by</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:border-slate-300 focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
                <option value="newest">Newest</option>
                <option value="best-deals">Best deals</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="mt-8 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center text-sm text-slate-200">
              <p className="text-base font-semibold text-slate-50">
                No items match these filters yet.
              </p>
              <p className="text-xs text-slate-400">
                Reset search and filters to see the full catalog, or jump to your saved items or cart.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={resetCatalog}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
                >
                  Reset search &amp; filters
                </button>
                <Link
                  href="/saved"
                  className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                >
                  Open saved
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                >
                  Go to cart
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-700 px-3 py-1.5 font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500 disabled:hover:border-slate-800 disabled:hover:bg-slate-950"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {paginationItems.map((item, idx) => {
                      if (item === "ellipsis") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-1 text-slate-500">
                            ...
                          </span>
                        );
                      }
                      const page = item;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-full border px-3 py-1.5 font-semibold transition ${
                            page === currentPage
                              ? "border-slate-100 bg-slate-100 text-slate-900"
                              : "border-slate-700 text-slate-100 hover:border-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-slate-700 px-3 py-1.5 font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500 disabled:hover:border-slate-800 disabled:hover:bg-slate-950"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
