/**
 * Spanish (es-AR) formatting helpers.
 * Follow project rule: use `$1.250` (dot as thousands separator), never `$1,250`.
 */

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a numeric ARS amount with es-AR conventions.
 * `formatARS(29000)` → `"$29.000"`.
 */
export function formatARS(amount: number): string {
  // Intl produces "ARS 29.000" or "$29.000" depending on ICU version; normalise.
  const raw = currency.format(amount);
  return raw.replace(/^ARS\s?/, "$").replace(/\u00a0/g, "");
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDateAR(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
