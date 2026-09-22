import { NextRequest, NextResponse } from "next/server";

import { nestApiBase } from "@/lib/nest-api-base";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const upstream = `${nestApiBase()}/public/org-name-check`;
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
          "No pudimos verificar el nombre. Intentá de nuevo en unos minutos.",
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
      /* keep */
    }
  }

  if (!res.ok) {
    const message =
      parsed &&
      typeof parsed === "object" &&
      "message" in parsed &&
      (parsed as { message: unknown }).message
        ? String((parsed as { message: unknown }).message)
        : "No pudimos verificar el nombre del negocio.";
    return NextResponse.json({ message }, { status: res.status });
  }

  return NextResponse.json(parsed, { status: res.status });
}
