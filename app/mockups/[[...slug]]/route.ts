import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, resolve } from "node:path";
import { NextResponse } from "next/server";

/**
 * Serve static mockup files (HTML/CSS/JS) from the repo-level `mockups/`
 * folder without moving them into `public/`. Preserving the folder in place
 * keeps QA reviewers and legacy links working (`/mockups/…`).
 */

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

const ROOT = resolve(process.cwd(), "mockups");

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await ctx.params;
  const relative = slug.join("/");
  const target = normalize(join(ROOT, relative));

  // Prevent path traversal escapes out of `mockups/`.
  if (!target.startsWith(ROOT)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const info = await stat(target);
    const finalPath = info.isDirectory() ? join(target, "index.html") : target;
    const data = await readFile(finalPath);
    const ext = extname(finalPath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
