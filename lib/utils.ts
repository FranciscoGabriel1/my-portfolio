import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date range string consistently. */
export function formatDateRange(start: string, end?: string, locale = "pt-BR"): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  const startDate = new Date(start).toLocaleDateString(locale, options);
  const endDate = end ? new Date(end).toLocaleDateString(locale, options) : "Presente";
  return `${startDate} — ${endDate}`;
}

/** Returns initials from a full name (max 2 chars). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
