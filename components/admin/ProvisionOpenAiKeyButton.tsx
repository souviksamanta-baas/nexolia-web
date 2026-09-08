"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminApi,
  ApiError,
  type AdminLlmCredentialStatus,
  type AdminOrganization,
} from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function planIncludesCopiPro(slug: string | undefined): boolean {
  const s = (slug ?? "").trim().toLowerCase();
  return s === "pro" || s === "enterprise" || s === "max" || s === "advanced";
}

function statusChip(status: AdminLlmCredentialStatus["status"]): {
  className: string;
  label: string;
} {
  if (status === "active") return { className: "badge badge-green", label: "Activa" };
  if (status === "failed") return { className: "badge badge-danger", label: "Error" };
  if (status === "pending") return { className: "badge badge-warn", label: "Pendiente" };
  if (status === "revoked") return { className: "badge badge-muted", label: "Revocada" };
  return { className: "badge badge-muted", label: "Sin clave" };
}

async function getAccessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("Sesión expirada. Volvé a iniciar sesión.");
  }
  return token;
}

export function ProvisionOpenAiKeyButton({
  organization,
}: {
  organization: AdminOrganization;
}) {
  const [status, setStatus] = useState<AdminLlmCredentialStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eligible = planIncludesCopiPro(organization.planSlug);

  const refresh = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const next = await adminApi.getLlmCredentials(token, organization.id);
      setStatus(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo cargar el estado de la clave.",
      );
    }
  }, [organization.id]);

  useEffect(() => {
    if (!eligible) {
      setStatus(null);
      return;
    }
    void refresh();
  }, [eligible, refresh]);

  if (!eligible) {
    return (
      <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
        La clave OpenAI dedicada solo aplica a planes Pro o Enterprise.
      </p>
    );
  }

  const chip = statusChip(status?.status ?? "missing");
  const canProvision =
    !status || status.status === "missing" || status.status === "failed" || status.status === "revoked";
  const canRevoke = status?.status === "active";

  const onProvision = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const next = await adminApi.provisionLlmCredentials(token, organization.id);
      setStatus(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo provisionar la clave OpenAI.",
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async () => {
    if (!window.confirm("¿Revocar la clave OpenAI dedicada de esta organización?")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const next = await adminApi.revokeLlmCredentials(token, organization.id);
      setStatus(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo revocar la clave.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>OpenAI / Copi</h3>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        <span className={chip.className}>{chip.label}</span>
        {status?.monthlySpendLimitUsd != null && status.status === "active" ? (
          <span className="badge badge-navy">Tope ${status.monthlySpendLimitUsd}/mes</span>
        ) : null}
      </div>
      {status?.lastError ? (
        <p className="login-error" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {status.lastError}
        </p>
      ) : null}
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {canProvision ? (
          <button
            className="btn btn-primary btn-sm"
            type="button"
            disabled={busy}
            onClick={() => void onProvision()}
          >
            {busy
              ? "Provisionando…"
              : status?.status === "failed"
                ? "Volver a intentar"
                : "Provisionar clave OpenAI"}
          </button>
        ) : null}
        {canRevoke ? (
          <button
            className="btn btn-sm"
            type="button"
            disabled={busy}
            onClick={() => void onRevoke()}
          >
            {busy ? "Revocando…" : "Revocar clave"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="login-error" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
