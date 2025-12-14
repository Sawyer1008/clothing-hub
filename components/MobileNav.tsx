"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/cart/CartContext";
import { useSavedProducts } from "@/context/SavedProductsContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { savedIds } = useSavedProducts();

  const navItems = [
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/catalog", label: "Catalog", active: pathname.startsWith("/catalog") },
    { href: "/assistant", label: "Assistant", active: pathname.startsWith("/assistant") },
    {
      href: "/saved",
      label: "Saved",
      active: pathname.startsWith("/saved"),
      badge: savedIds.length,
    },
    {
      href: "/cart",
      label: "Cart",
      active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"),
      badge: cartCount,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-800 bg-slate-950/90 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 text-xs">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition ${
              item.active ? "text-slate-50" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <span className="text-[11px] font-medium">{item.label}</span>
            {item.badge ? (
              <span className="absolute -top-1 right-3 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sky-500 text-[10px] font-semibold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
