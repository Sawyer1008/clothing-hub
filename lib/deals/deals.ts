import type { Product } from "@/types/product";

export type DealInfo = {
  isOnSale: boolean;
  amount: number;
  original?: number | null;
  amountOff: number;
  percentOff: number;
  isValidSale: boolean;
  label: string | null;
};

const buildNoSaleInfo = (amount: number, original?: number | null): DealInfo => ({
  isOnSale: false,
  amount,
  original: original ?? null,
  amountOff: 0,
  percentOff: 0,
  isValidSale: false,
  label: null,
});

// getDealInfoFromPrice(80, 100) -> { isOnSale: true, amountOff: 20, percentOff: 20, label: "20% off", ... }
// getDealInfoFromPrice(99.6, 100) -> { isOnSale: true, amountOff: 0.4, percentOff: 0, label: "On sale", ... }
// getDealInfoFromPrice(100, 100) -> { isOnSale: false, amountOff: 0, percentOff: 0, label: null, ... }
// getDealInfoFromPrice(Number.NaN, 100) -> { isOnSale: false, isValidSale: false, label: null, ... }
export const getDealInfoFromPrice = (
  amount: number,
  original?: number
): DealInfo => {
  const normalizedOriginal = original ?? null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return buildNoSaleInfo(amount, normalizedOriginal);
  }

  if (normalizedOriginal == null) {
    return buildNoSaleInfo(amount, normalizedOriginal);
  }

  if (!Number.isFinite(normalizedOriginal) || normalizedOriginal <= amount) {
    return buildNoSaleInfo(amount, normalizedOriginal);
  }

  const amountOff = normalizedOriginal - amount;
  const percentOff = Math.round((amountOff / normalizedOriginal) * 100);
  const label = percentOff > 0 ? `${percentOff}% off` : "On sale";

  return {
    isOnSale: true,
    amount,
    original: normalizedOriginal,
    amountOff,
    percentOff,
    isValidSale: true,
    label,
  };
};

export const getDealInfo = (product: Product): DealInfo =>
  getDealInfoFromPrice(product.price.amount, product.price.originalAmount);
