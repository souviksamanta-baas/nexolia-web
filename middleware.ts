import { NextRequest, NextResponse } from "next/server";

/**
 * Host-based routing.
 *
 * - Apex (nexolia.com.ar): public site — /comenzar, legal, home
 * - admin.* : staff portal (paths rewritten under /admin/*)
 *
 * Localhost: `?admin=1` sets a sticky cookie for staff UI, but never hijacks
 * public routes (/comenzar, /privacidad, etc.).
 */
const PUBLIC_PATHS = [
  "/comenzar",
  "/onboarding", // legacy alias → redirected in next.config
  "/privacidad",
  "/privacy",
  "/eliminacion-de-cuenta",
  "/account-deletion",
  "/mockups",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = (req.headers.get("host") || "").toLowerCase();
  const pathname = url.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/mockups") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/nexolia-logo.svg" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isAdminHost = host.startsWith("admin.");
  const adminQueryFlag = url.searchParams.get("admin") === "1";
  const adminCookie = req.cookies.get("nex_admin")?.value === "1";
  const pathIsAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // Admin host should not serve public onboarding — send people to the apex.
  if (isAdminHost && isPublicPath(pathname)) {
    const apex =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://nexolia.com.ar";
    return NextResponse.redirect(new URL(pathname + url.search, apex));
  }

  if (adminQueryFlag && !isAdminHost) {
    const dest = url.clone();
    dest.searchParams.delete("admin");
    if (!dest.pathname.startsWith("/admin")) {
      dest.pathname = "/admin" + (dest.pathname === "/" ? "" : dest.pathname);
    }
    const res = NextResponse.redirect(dest);
    res.cookies.set("nex_admin", "1", { path: "/", sameSite: "lax" });
    return res;
  }

  if (isAdminHost) {
    // Canonicalize: never show /admin/* in the address bar on admin.*
    if (pathIsAdmin) {
      const stripped =
        pathname === "/admin" ? "/" : pathname.slice("/admin".length) || "/";
      url.pathname = stripped;
      return NextResponse.redirect(url);
    }
    url.pathname = "/admin" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  // Sticky localhost admin mode: only rewrite non-public paths.
  if (adminCookie && !pathIsAdmin && !isPublicPath(pathname)) {
    url.pathname = "/admin" + (pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
