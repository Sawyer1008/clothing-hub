// app/product/[id]/page.tsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog";

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
      <div className="space-y-4">
        <p className="text-lg font-semibold text-slate-50">Product not found</p>
        <Link
          href="/catalog"
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

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
              ${product.price.amount.toFixed(2)}
            </span>
            {product.price.originalAmount &&
              product.price.originalAmount > product.price.amount && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.price.originalAmount.toFixed(2)}
                </span>
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
              <div
                key={p.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-100"
              >
                <Link href={`/product/${String(p.id)}`}>{p.name}</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
