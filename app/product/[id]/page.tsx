// app/product/[id]/page.tsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getDealInfo } from "@/lib/deals/deals";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog";
import { formatPrice } from "@/utils/formatPrice";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const allProducts: Product[] = getAllProducts();
  const norm = (s: string) => {
    try {
      return decodeURIComponent(s).trim();
    } catch {
      return s.trim();
    }
  };

  const resolvedParams: any = await Promise.resolve(params as any);
  const rawParam = String(resolvedParams?.id ?? "");
  const target = norm(rawParam);

  const product =
    allProducts.find((p) => norm(String(p.id)) === target) ??
    allProducts.find((p) => String(p.id).trim() === target) ??
    allProducts.find((p) => encodeURIComponent(String(p.id)) === rawParam);

  if (!product) {
    console.log("[product-page] rawParam=", rawParam, "target=", target);
    console.log(
      "[product-page] sampleIds=",
      allProducts.slice(0, 10).map((p) => String(p.id))
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-2xl py-10">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Product not found
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            That item isn&apos;t available right now.
          </h1>
          <p className="text-sm text-slate-300">
            Explore the catalog or ask the Stylist to find a similar look.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold">
            <Link
              href="/catalog"
              className="rounded-full bg-slate-100 px-4 py-2 text-slate-900 transition hover:bg-slate-200"
            >
              Browse catalog
            </Link>
            <Link
              href="/assistant"
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
            >
              Ask the Stylist
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const deal = getDealInfo(product);
  const moreFromBrand = allProducts
    .filter((p) => p.brand === product.brand && String(p.id) !== String(product.id))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Left: product card (image + save + add to cart) */}
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <ProductCard product={product} />
          </div>
        </div>

        {/* Right: meta */}
        <div className="w-full md:w-1/2 space-y-4">
          <Link
            href="/catalog"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Back to catalog
          </Link>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {product.brand}
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.subcategory && (
              <p className="text-xs text-slate-400">{product.subcategory}</p>
            )}
          </div>

          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-lg font-semibold text-slate-50">
              {formatPrice(deal.amount)}
            </span>
            {deal.isOnSale && deal.original != null && (
              <>
                <span className="text-xs text-slate-500 line-through">
                  {formatPrice(deal.original)}
                </span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-400/60">
                  {deal.label ?? "On sale"}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-slate-300">{product.description}</p>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Colors
              </p>
              <p className="text-sm text-slate-200">
                {product.colors.join(", ")}
              </p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
            >
              View on {product.brand}
            </a>
          </div>
        </div>
      </div>

      {moreFromBrand.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight">
            More from {product.brand}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {moreFromBrand.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
