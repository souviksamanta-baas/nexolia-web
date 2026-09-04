"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FabGrok() {
  const pathname = usePathname();
  // Hide the FAB on the Grok dashboard itself (would be redundant).
  if (pathname?.startsWith("/admin/dashboard/grok")) return null;

  return (
    <Link className="fab-grok" href="/admin/dashboard/grok">
      <svg className="spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l1.2 6.3L19 12l-5.8 3.7L12 22l-1.2-6.3L5 12l5.8-3.7L12 2z" />
      </svg>
      <span className="label">Asistente Grok</span>
    </Link>
  );
}
