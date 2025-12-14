// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

import { CartProvider } from "./cart/CartContext";
import { SavedProductsProvider } from "@/context/SavedProductsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clothing Hub",
  description: "Unified fashion shopping demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className={`${inter.className} h-full text-slate-50`}>
        <CartProvider>
          <SavedProductsProvider>
            <div className="flex min-h-screen flex-col">
              {/* Desktop Navbar */}
              <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <Navbar />
              </header>

              {/* Main page content */}
              <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
                  {children}
                </div>
              </main>

              {/* Desktop Footer */}
              <footer className="hidden border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 md:block">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                  <span>© {year} Clothing Hub</span>
                  <span>Phase 2 · UX + Semantic OS</span>
                </div>
                <div className="mx-auto max-w-6xl px-4 pb-3 text-center text-[11px] text-slate-500 sm:px-6">
                  Clothing Hub — Sandbox Phase
                </div>
              </footer>

              {/* Mobile bottom navigation */}
              <MobileNav />
            </div>
          </SavedProductsProvider>
        </CartProvider>
      </body>
    </html>
  );
}
