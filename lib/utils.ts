import clsx from "clsx";

export function cn(...classes: Array<string | false | null | undefined>) {
  return clsx(classes);
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function toSentenceCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [];
}

export function parseDelimitedList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyDelimitedList(value: unknown) {
  return parseJsonArray(value).join(", ");
}

export function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function buildGoogleSearchLink(name: string, city?: string) {
  const query = [name, city, "Google reviews"].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getAverageRating(items: Array<{ rating?: number }> = []) {
  if (items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + (item.rating ?? 0), 0);
  return Math.round((total / items.length) * 10) / 10;
}

export function formatRating(value: number | null) {
  return value ? `${value.toFixed(1)}/5` : "New profile";
}
