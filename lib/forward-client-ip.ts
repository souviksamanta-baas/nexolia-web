import type { NextRequest } from "next/server";

/**
 * Best-effort client IP for Nest throttling behind this Next.js proxy.
 * Prefer the left-most X-Forwarded-For hop (original client).
 */
export function resolveClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

export function nestProxyHeaders(
  req: NextRequest,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };

  const clientIp = resolveClientIp(req);
  if (clientIp) {
    headers["X-Forwarded-For"] = clientIp;
    headers["X-Real-IP"] = clientIp;
  }

  return headers;
}
