"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ConvertLeadButton({
  leadId,
  orgName,
  ownerEmail,
}: {
  leadId: string;
  orgName: string;
  ownerEmail: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConvert = async () => {
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
      await adminApi.convertLead(token, leadId, {
        orgName,
        ownerEmail,
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo convertir el lead.",
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
        onClick={() => void onConvert()}
      >
        {busy ? "Creando org…" : "Crear organización"}
      </button>
      {error && (
        <p className="login-error" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
