import { MenuItem } from "../types";

/**
 * Calculates the base unit price adjusted by size.
 * - Small: 80% of original price (-20%)
 * - Medium: 100% of original price (standard)
 * - Large: 135% of original price for Pizza (+35%), or 120% for other items (+20%)
 */
export function getSizeAdjustedPrice(price: number, size: "Small" | "Medium" | "Large", category: string): number {
  if (size === "Small") {
    return Number((price * 0.8).toFixed(3));
  } else if (size === "Large") {
    const factor = category === "pizza" ? 1.35 : 1.2;
    return Number((price * factor).toFixed(3));
  }
  return Number(price.toFixed(3));
}

/**
 * Calculates volume (unit count) discount.
 * - 1 unit: 0% off
 * - 2 units: 5% off
 * - 3 to 4 units: 8% off
 * - 5+ units: 12% off
 */
export function getVolumeDiscountPercentage(quantity: number): number {
  if (quantity >= 5) {
    return 12; // 12% off
  } else if (quantity >= 3) {
    return 8; // 8% off
  } else if (quantity === 2) {
    return 5; // 5% off
  }
  return 0; // 0% off
}

/**
 * Calculates the fully optimized unit price after applying size factor and unit count discount.
 */
export function getOptimizedUnitPrice(
  basePrice: number,
  size: "Small" | "Medium" | "Large",
  quantity: number,
  category: string
): number {
  const sizeAdjusted = getSizeAdjustedPrice(basePrice, size, category);
  const discountPercent = getVolumeDiscountPercentage(quantity);
  const finalPrice = sizeAdjusted * (1 - discountPercent / 100);
  return Number(finalPrice.toFixed(3));
}

/**
 * Generates an informative breakdown of the price optimization.
 */
export interface PriceBreakdown {
  originalMenuPrice: number;
  sizeAdjustedPrice: number;
  quantityDiscountPercent: number;
  savingsPerUnit: number;
  finalOptimizedUnitPrice: number;
  totalPrice: number;
}

export function getPriceBreakdown(
  item: MenuItem,
  size: "Small" | "Medium" | "Large",
  quantity: number
): PriceBreakdown {
  const effectiveBasePrice = (item.discountPrice && item.discountPrice < item.price)
    ? item.discountPrice
    : item.price;

  const sizePrice = getSizeAdjustedPrice(effectiveBasePrice, size, item.category);
  const discountPercent = getVolumeDiscountPercentage(quantity);
  const finalUnitPrice = getOptimizedUnitPrice(effectiveBasePrice, size, quantity, item.category);
  const savings = Math.max(0, sizePrice - finalUnitPrice);
  const total = Number((finalUnitPrice * quantity).toFixed(3));

  return {
    originalMenuPrice: item.price,
    sizeAdjustedPrice: sizePrice,
    quantityDiscountPercent: discountPercent,
    savingsPerUnit: Number(savings.toFixed(3)),
    finalOptimizedUnitPrice: finalUnitPrice,
    totalPrice: total,
  };
}
