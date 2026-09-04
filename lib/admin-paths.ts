/**
 * Admin UI lives under `app/admin/*`.
 * On `admin.nexolia.com.ar`, middleware rewrites `/dashboard` → `/admin/dashboard`
 * so the browser URL should stay `/dashboard` (no duplicated `/admin` prefix).
 */

export function isAdminHostname(host: string | null | undefined): boolean {
  return (host || "").toLowerCase().startsWith("admin.");
}

/** Strip optional `/admin` prefix for comparisons (works on both hosts). */
export function normalizeAdminPathname(pathname: string): string {
  if (pathname === "/admin") return "/";
  if (pathname.startsWith("/admin/")) {
    return pathname.slice("/admin".length) || "/";
  }
  return pathname;
}

/**
 * Build a staff portal href.
 * @param cleanPath path without `/admin` prefix, e.g. `/dashboard` or `/pronto?m=WhatsApp`
 */
export function adminHref(
  cleanPath: string,
  opts?: { host?: string | null; onAdminHost?: boolean },
): string {
  const raw = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const [pathPart, query = ""] = raw.split("?");
  const clean =
    pathPart === "/admin"
      ? "/"
      : pathPart.startsWith("/admin/")
        ? pathPart.slice("/admin".length) || "/"
        : pathPart;

  const onAdminHost =
    opts?.onAdminHost ??
    (opts?.host !== undefined
      ? isAdminHostname(opts.host)
      : typeof window !== "undefined"
        ? isAdminHostname(window.location.host)
        : false);

  const href = onAdminHost
    ? clean
    : clean === "/"
      ? "/admin"
      : `/admin${clean}`;

  return query ? `${href}?${query}` : href;
}
