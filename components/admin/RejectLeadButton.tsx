"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function RejectLeadButton({
  leadId,
  orgName,
}: {
  leadId: string;
  orgName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onReject = async () => {
    const confirmed = window.confirm(
      `¿Rechazar la solicitud de “${orgName}”? El lead quedará en la tabla con estado Rechazado.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      }
      await adminApi.rejectLead(token, leadId);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo rechazar el lead.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-secondary btn-sm"
        type="button"
        disabled={busy}
        onClick={() => void onReject()}
      >
        {busy ? "Rechazando…" : "Rechazar solicitud"}
      </button>
      {error && (
        <p className="login-error" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
