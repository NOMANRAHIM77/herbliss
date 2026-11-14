import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Money is stored in paisa (100 paisa = 1 PKR). */
export function formatPrice(paisa: number) {
  if (!Number.isSafeInteger(paisa) || paisa < 0) {
    throw new RangeError("Price must be a non-negative integer in paisa.");
  }
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: paisa % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paisa / 100)}`;
}
