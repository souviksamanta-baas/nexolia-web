"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { adminHref } from "@/lib/admin-paths";

interface AdminHeaderProps {
  userLabel?: string;
  roleLabel?: string;
}

export function AdminHeader({
  userLabel,
  roleLabel = "Super Admin",
}: AdminHeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const toggleDrawer = () => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("drawer-open");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace(adminHref("/login"));
      router.refresh();
    } catch {
      // ignore — sign-out failures aren't user-facing
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="admin-header">
      <button
        className="menu-toggle"
        type="button"
        aria-label="Abrir menú"
        onClick={toggleDrawer}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="search-box" role="search">
        <span aria-hidden="true">⌕</span>
        <span>Buscar…</span>
        <kbd>⌘K</kbd>
      </div>
      <div className="header-actions">
        <button className="icon-btn" type="button" aria-label="Notificaciones">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
            <path d="M9 17a3 3 0 0 0 6 0" />
          </svg>
          <span className="ping" />
        </button>
        <span className="badge badge-navy">{roleLabel}</span>
        {userLabel && (
          <span className="muted" style={{ fontSize: "0.82rem" }}>
            {userLabel}
          </span>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleSignOut}
          disabled={signingOut}
          title="Cerrar sesión"
        >
          {signingOut ? "Saliendo…" : "Salir"}
        </button>
      </div>
    </header>
  );
}
