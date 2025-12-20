import Link from "next/link";

export default function Page() {
  return (
    <section className="mx-auto max-w-2xl py-10">
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Internal route
        </p>
        <h1 className="text-xl font-semibold text-slate-50">
          Sandbox is for internal checks.
        </h1>
        <p className="text-sm text-slate-300">
          Head back to the live shopping flows whenever you&apos;re ready.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold">
          <Link
            href="/"
            className="rounded-full bg-slate-100 px-4 py-2 text-slate-900 transition hover:bg-slate-200"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
          >
            Catalog
          </Link>
          <Link
            href="/assistant"
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
          >
            Stylist
          </Link>
        </div>
      </div>
    </section>
  );
}
