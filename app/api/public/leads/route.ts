import { NextRequest, NextResponse } from "next/server";

import { nestApiBase } from "@/lib/nest-api-base";

/**
 * Same-origin proxy for public lead intake.
 * Avoids baking localhost into the browser bundle and sidesteps CORS.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "JSON inválido." },
      { status: 400 },
    );
  }

  const upstream = `${nestApiBase()}/public/leads`;
  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    const message =
      parsed &&
      typeof parsed === "object" &&
      "message" in parsed &&
      (parsed as { message: unknown }).message
        ? String((parsed as { message: unknown }).message)
        : "No pudimos enviar tu solicitud. Intentá de nuevo en unos minutos.";
    return NextResponse.json({ message }, { status: res.status });
  }

  return NextResponse.json(parsed, { status: res.status });
}
