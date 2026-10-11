"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  ApiError,
  type AdminOrganization,
} from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

type ConfirmMode = "archive" | "delete" | null;

export function OrgLifecycleActions({
  organization,
  staffRole,
}: {
  organization: AdminOrganization;
  staffRole: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [confirmation, setConfirmation] = useState("");

  const archived = Boolean(organization.archivedAt);
  const paused = organization.status === "paused";
  const isSuperAdmin = staffRole === "super_admin";

  const refresh = () => {
    router.refresh();
  };

  const onPauseToggle = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (paused) {
        await adminApi.resumeOrganization(token, organization.id);
      } else {
        await adminApi.pauseOrganization(token, organization.id);
      }
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onConfirmDestructive = async () => {
    if (!confirmMode) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (confirmMode === "archive") {
        await adminApi.archiveOrganization(token, organization.id, {
          confirmation,
        });
      } else {
        await adminApi.deleteOrganization(token, organization.id, {
          confirmation,
        });
      }
      setConfirmMode(null);
      setConfirmation("");
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo completar la acción.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>Ciclo de vida</h3>
      <div className="detail-actions" style={{ marginTop: "0.5rem" }}>
        {!archived ? (
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            disabled={busy}
            onClick={() => void onPauseToggle()}
          >
            {busy ? "Guardando…" : paused ? "Reanudar" : "Pausar"}
          </button>
        ) : null}
        {!archived ? (
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            disabled={busy}
            onClick={() => {
              setConfirmMode("archive");
              setConfirmation("");
              setError(null);
            }}
          >
            Archivar
          </button>
        ) : null}
        {isSuperAdmin ? (
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            disabled={busy}
            onClick={() => {
              setConfirmMode("delete");
              setConfirmation("");
              setError(null);
            }}
            style={{ color: "var(--danger, #b42318)" }}
          >
            Eliminar
          </button>
        ) : null}
      </div>

      {confirmMode ? (
        <div
          style={{
            marginTop: "0.85rem",
            padding: "0.85rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
          }}
        >
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>
            {confirmMode === "archive" ? (
              <>
                Escribí <code>ARCHIVAR</code> para confirmar. Se desconectan canales y el
                negocio deja de aparecer en la app.
              </>
            ) : (
              <>
                Escribí el nombre exacto de la organización (
                <strong>{organization.name}</strong>) para borrarla de forma permanente.
              </>
            )}
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={confirmMode === "archive" ? "ARCHIVAR" : organization.name}
            style={{ width: "100%", marginBottom: "0.5rem" }}
            disabled={busy}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              disabled={busy || !confirmation.trim()}
              onClick={() => void onConfirmDestructive()}
            >
              {busy
                ? "Procesando…"
                : confirmMode === "archive"
                  ? "Confirmar archivo"
                  : "Confirmar eliminación"}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmMode(null);
                setConfirmation("");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="login-error" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
