import { NextResponse } from "next/server";

import { nestApiBase } from "@/lib/nest-api-base";

/** Same-origin proxy for public plan catalog (/comenzar). */
export async function GET() {
  const upstream = `${nestApiBase()}/public/plans`;
  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "No pudimos contactar el servidor. Intentá de nuevo en unos minutos.",
      },
      { status: 502 },
    );
  }

  const raw = await res.text();
  let parsed: unknown = raw;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      /* keep text */
    }
  }

  if (!res.ok) {
    return NextResponse.json(
      { message: "No pudimos cargar los planes." },
      { status: res.status },
    );
  }

  return NextResponse.json(parsed, { status: res.status });
}
