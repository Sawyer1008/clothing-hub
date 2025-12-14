"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/catalog/catalog";
import type { StylistResponse } from "@/types/stylist";

export default function AssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stylistPrompt, setStylistPrompt] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [stylistResult, setStylistResult] = useState<StylistResponse | null>(null);
  const [stylistLoading, setStylistLoading] = useState(false);
  const [stylistError, setStylistError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"v2" | "v1">("v2");

  const products = useMemo(() => getAllProducts(), []);
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setAnswer(data.text);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStylistSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = stylistPrompt.trim();
    if (!trimmed) return;

    setStylistLoading(true);
    setStylistError(null);
    setStylistResult(null);

    const budgetValue = maxBudget.trim();
    const budgetNumber =
      budgetValue && !Number.isNaN(Number(budgetValue))
        ? Number(budgetValue)
        : undefined;

    try {
      const res = await fetch("/api/stylist2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          maxBudget: budgetNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStylistError(data.error || "Something went wrong.");
      } else {
        setStylistResult(data as StylistResponse);
      }
    } catch (err) {
      console.error(err);
      setStylistError("Network error. Please try again.");
    } finally {
      setStylistLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl fade-in-up">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">AI Styling Assistant</h1>
        <p className="text-sm text-slate-300">
          Ask for outfit ideas, budgets, or how to style certain pieces. The AI
          will suggest combos using Abercrombie, H&amp;M, and PacSun style items.
        </p>
      </header>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("v2")}
          className={`rounded-t-md px-3 py-2 text-xs font-semibold ${
            activeTab === "v2"
              ? "bg-slate-800 text-slate-100"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          Catalog Stylist (v2)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("v1")}
          className={`rounded-t-md px-3 py-2 text-xs font-semibold ${
            activeTab === "v1"
              ? "bg-slate-800 text-slate-100"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          Legacy Stylist (v1)
        </button>
      </div>

      {activeTab === "v2" && (
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Catalog Outfit (AI Stylist 2.0)</h2>
            <p className="text-sm text-slate-300">
              Get outfit ideas using real products from our catalog.
            </p>
          </div>

          <form onSubmit={handleStylistSubmit} className="space-y-3">
            <textarea
              value={stylistPrompt}
              onChange={(e) => setStylistPrompt(e.target.value)}
              placeholder='Example: "Streetwear look with cargos under $120"'
              className="w-full min-h-[120px] rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="Max budget (optional)"
                className="w-40 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                disabled={stylistLoading || !stylistPrompt.trim()}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {stylistLoading ? "Curating..." : "Build outfit"}
              </button>
            </div>
          </form>

          {stylistError && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {stylistError}
            </div>
          )}

          {stylistResult && (
            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3">
              <p className="text-sm text-slate-200">{stylistResult.explanation}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {stylistResult.primaryOutfit.map((id) => {
                  const product = productMap.get(id);
                  if (!product) return null;
                  return <ProductCard key={id} product={product} />;
                })}
              </div>
              {stylistResult.alternates && stylistResult.alternates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                    Alternates
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {stylistResult.alternates.map((id) => {
                      const product = productMap.get(id);
                      if (!product) return null;
                      return <ProductCard key={id} product={product} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "v1" && (
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Legacy Stylist (v1)</h2>
            <p className="text-sm text-slate-300">
              Ask any styling question and get a simple answer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Example: "I want a casual streetwear outfit under $150"'
              className="w-full min-h-[120px] rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Get outfit ideas"}
            </button>
          </form>

          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
