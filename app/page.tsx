import Link from "next/link";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog.server";
import { formatPrice } from "@/utils/formatPrice";

type CatalogPreviewState = "loading" | "ready" | "empty" | "error";

function getSampleProducts(): Product[] {
  const all = getAllProducts();
  return all.slice(0, 4);
}

function getCatalogPreview(): { state: CatalogPreviewState; products: Product[] } {
  const simulateLoading =
    process.env.CH_PREVIEW_LOADING === "1" ||
    process.env.CH_PREVIEW_LOADING === "true";

  if (simulateLoading) {
    return { state: "loading", products: [] };
  }

  let state: CatalogPreviewState = "loading";
  let products: Product[] = [];

  try {
    products = getSampleProducts();
    state = products.length > 0 ? "ready" : "empty";
  } catch (error) {
    state = "error";
  }

  return { state, products };
}

export default function HomePage() {
  const { state: previewState, products: sampleProducts } = getCatalogPreview();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 fade-in-up">
      {/* Top hero section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 md:flex-row md:items-center">
          {/* Left: text */}
          <div className="flex-1 space-y-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Style Hub · Shopping OS
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Style Hub is the Shopping OS for multi-brand fashion.
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              A unified catalog to save across brands and get stylist-led discovery in one place.
              We are not a retailer; checkout happens on store sites.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                Browse catalog
              </Link>
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-300 hover:bg-slate-900"
              >
                Ask the AI stylist
              </Link>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-50">Discover across brands</p>
                <p className="mt-1 text-slate-400">
                  Unified catalog entries keep sizes, prices, and tags together.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-50">Stylist built-in</p>
                <p className="mt-1 text-slate-400">
                  Outfit ideas mapped to real products and budgets you set.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-50">Checkout honesty</p>
                <p className="mt-1 text-slate-400">
                  We send you to each retailer to pay. Returns and shipping are handled by the store.
                </p>
              </div>
            </div>

            {/* Quick category nav row */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Quick start
              </span>
              <Link
                href="/catalog?gender=mens"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              >
                Shop men
              </Link>
              <Link
                href="/catalog?gender=womens"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              >
                Shop women
              </Link>
              <Link
                href="/catalog?sort=new"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              >
                New arrivals
              </Link>
              <Link
                href="/catalog?style=streetwear"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              >
                Streetwear picks
              </Link>
              <Link
                href="/catalog?budget=under-75"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
              >
                Under $75
              </Link>
            </div>
          </div>

          {/* Right: simple “category navigation” tiles */}
          <div className="flex-1">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Men tile */}
              <Link
                href="/catalog?gender=mens"
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Shop men
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">
                    Hoodies, cargos, sneakers
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Streetwear basics and everyday fits from multiple brands.
                  </p>
                </div>
                <span className="mt-3 inline-flex w-max items-center gap-1 text-[11px] text-slate-300">
                  Browse men&apos;s catalog
                  <span className="translate-x-0 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>

              {/* Women tile */}
              <Link
                href="/catalog?gender=womens"
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-500 hover:bg-slate-900"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Shop women
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">
                    Basics, layers, going-out tops
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Build everyday outfits or night-out looks across brands.
                  </p>
                </div>
                <span className="mt-3 inline-flex w-max items-center gap-1 text-[11px] text-slate-300">
                  Browse women&apos;s catalog
                  <span className="translate-x-0 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>

              {/* New arrivals tile */}
              <Link
                href="/catalog?sort=new"
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-500 hover:bg-slate-900 sm:col-span-2"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    New &amp; trending
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">
                    Fresh drops across every brand
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Fresh drops and standout items, hand-picked to stay current across brands.
                  </p>
                </div>
                <span className="mt-3 inline-flex w-max items-center gap-1 text-[11px] text-slate-300">
                  See new arrivals
                  <span className="translate-x-0 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core flows grid */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Core flows
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Start with the flows shoppers use most.
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs text-slate-300 underline-offset-2 hover:underline"
          >
            Open catalog
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/catalog"
            className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Discover
            </p>
            <h3 className="mt-1 text-base font-semibold">Browse the catalog</h3>
            <p className="mt-1 text-xs text-slate-400">
              Search and filter across brands with real sizes, prices, and tags.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-300">
              Go to catalog
              <span className="translate-x-0 transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>

          <Link
            href="/assistant"
            className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Get outfit ideas
            </p>
            <h3 className="mt-1 text-base font-semibold">Ask the assistant</h3>
            <p className="mt-1 text-xs text-slate-400">
              Describe the vibe, budget, or occasion and get linked product ideas.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-300">
              Open assistant
              <span className="translate-x-0 transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>

          <Link
            href="/saved"
            className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Save shortlist
            </p>
            <h3 className="mt-1 text-base font-semibold">Save items to compare</h3>
            <p className="mt-1 text-xs text-slate-400">
              Keep picks in one place before deciding what to add to cart.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-300">
              View saved items
              <span className="translate-x-0 transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>

          <Link
            href="/cart"
            className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Review cart
            </p>
            <h3 className="mt-1 text-base font-semibold">Prep for checkout</h3>
            <p className="mt-1 text-xs text-slate-400">
              See what&apos;s ready to send to retailers and what still needs a size.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-300">
              Go to cart
              <span className="translate-x-0 transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Trust + how it works */}
      <section className="border-y border-slate-800 bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              How it works
            </p>
            <h3 className="text-xl font-semibold tracking-tight">
              Four steps, honest checkout.
            </h3>
            <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Step 1
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  Browse the unified catalog
                </p>
                <p className="mt-1 text-slate-400">
                  Search and filter across brands with sizes, pricing, and tags in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Step 2
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  Save items across brands
                </p>
                <p className="mt-1 text-slate-400">
                  Keep a single shortlist and compare picks before moving to cart.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Step 3
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  Refine picks with the stylist
                </p>
                <p className="mt-1 text-slate-400">
                  Use the assistant to tighten the vibe, fit, or budget with linked products.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Step 4
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  Use checkout tools
                </p>
                <p className="mt-1 text-slate-400">
                  Build the cart here; we route you to retailer sites to pay.
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-[11px] text-slate-400 sm:grid-cols-3">
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-center">
                Curated catalog (no scraping at scale)
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-center">
                Stable product IDs across views
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 text-center">
                Consistent sale labels across the app
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Checkout happens on retailer sites. We never process payments; returns and shipping stay
              with the store.
            </p>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-50">Keep momentum</p>
            <p className="mt-1 text-xs text-slate-400">
              Skip dead ends with quick links into every flow you might need next.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/checkout"
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Continue to checkout
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
              >
                View cart
              </Link>
              <Link
                href="/catalog"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
              >
                Back to catalog
              </Link>
              <Link
                href="/saved"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
              >
                Saved items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple “sample from catalog” strip with states */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Catalog preview
            </h2>
            <p className="text-xs text-slate-400">
              A focused sample of real products to set the tone.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs text-slate-300 underline-offset-2 hover:underline"
          >
            Open full catalog
          </Link>
        </div>

        {previewState === "loading" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs"
              >
                <div className="mb-2 h-32 w-full animate-pulse rounded-xl bg-slate-900" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-slate-900" />
                <div className="mt-2 h-3 w-16 animate-pulse rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {previewState === "error" && (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-100">
              Couldn&apos;t load catalog preview
            </p>
            <p className="mt-1 text-xs text-amber-100/80">
              Keep shopping while it reloads. You can also head straight into the catalog.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/catalog"
                className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-200"
              >
                Open catalog
              </Link>
              <Link
                href="/assistant"
                className="rounded-full border border-amber-200/60 px-4 py-2 text-xs font-semibold text-amber-50 transition hover:border-amber-200 hover:bg-amber-500/10"
              >
                Get outfit ideas
              </Link>
            </div>
          </div>
        )}

        {previewState === "empty" && (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm font-semibold">No products available yet</p>
            <p className="mt-1 text-xs text-slate-400">
              We&apos;re refreshing the catalog preview. Jump into the catalog or ask the assistant for ideas.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/catalog"
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Go to catalog
              </Link>
              <Link
                href="/assistant"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
              >
                Ask the AI stylist
              </Link>
            </div>
          </div>
        )}

        {previewState === "ready" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {sampleProducts.map((product) => {
              const imageUrl = product.images?.[0]?.url;
              const imageAlt = product.images?.[0]?.alt || product.name || "Product image";
              const brandName = product.brand || product.sourceName || "Brand";
              const displayPrice =
                product?.price?.amount !== undefined
                  ? formatPrice(product.price.amount)
                  : "Price unavailable";

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs transition hover:border-slate-500 hover:bg-slate-900"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="mb-2 h-32 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mb-2 flex h-32 w-full items-center justify-center rounded-xl bg-slate-900 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Image unavailable
                    </div>
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {brandName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-100">
                    {product.name || "Untitled product"}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-50">{displayPrice}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Next steps row */}
      <section className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Next steps
            </p>
            <h3 className="text-lg font-semibold tracking-tight">Jump back in</h3>
            <p className="text-xs text-slate-400">
              Keep exploring, compare saved picks, or review your cart before heading to checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/catalog"
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Catalog
            </Link>
            <Link
              href="/saved"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
            >
              Saved
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
            >
              Cart
            </Link>
            <Link
              href="/checkout"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
            >
              Checkout
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
