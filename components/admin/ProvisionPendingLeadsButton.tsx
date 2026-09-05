"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Creates orgs for all leads that still lack organization_id. */
export function ProvisionPendingLeadsButton({
  pendingCount,
}: {
  pendingCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (pendingCount <= 0) return null;

  const onClick = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      }
      const result = await adminApi.provisionPendingLeads(token);
      setMessage(
        `Listo: ${result.converted} org${result.converted === 1 ? "" : "s"} creada${
          result.converted === 1 ? "" : "s"
        }${result.failed ? ` · ${result.failed} con error` : ""}.`,
      );
      router.refresh();
    } catch (err) {
      setMessage(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo provisionar.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary btn-sm"
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
      >
        {busy
          ? "Creando organizaciones…"
          : `Crear orgs (${pendingCount} pendientes)`}
      </button>
      {message && (
        <p className="hint" style={{ marginTop: "0.5rem" }}>
          {message}
        </p>
      )}
    </div>
  );
}
