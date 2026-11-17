import { NextRequest, NextResponse } from "next/server";

import { nestProxyHeaders } from "@/lib/forward-client-ip";
import { nestApiBase } from "@/lib/nest-api-base";

/** Same-origin proxy → Nest Spanish staff password-reset email. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const upstream = `${nestApiBase()}/public/admin/password-reset`;
  let res: Response;
  try {
    res = await fetch(upstream, {
      method: "POST",
      headers: nestProxyHeaders(req),
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
        : "No pudimos enviar el correo de recuperación.";
    return NextResponse.json({ message }, { status: res.status });
  }

  return NextResponse.json(parsed, { status: res.status });
}
