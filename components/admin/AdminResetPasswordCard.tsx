"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function loginHref(): string {
  if (typeof window === "undefined") return "/admin/login";
  return window.location.hostname.toLowerCase().startsWith("admin.")
    ? "/login"
    : "/admin/login";
}

/**
 * Recovery landing. Supports:
 * - `?token_hash=&type=recovery` (Resend Spanish mail from Nest)
 * - `?code=` (Supabase PKCE)
 * - hash / PASSWORD_RECOVERY events (legacy Supabase mailer)
 */
export function AdminResetPasswordCard() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const markReady = () => {
      if (!cancelled) {
        setReady(true);
        setError(null);
      }
    };

    const markInvalid = (message?: string) => {
      if (!cancelled) {
        setReady(false);
        setError(
          message ||
            "El enlace de recuperación no es válido o expiró. Pedí uno nuevo desde el login.",
        );
      }
    };

    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );

        const tokenHash =
          url.searchParams.get("token_hash") ||
          hashParams.get("token_hash") ||
          "";
        const type =
          url.searchParams.get("type") || hashParams.get("type") || "recovery";
        const code = url.searchParams.get("code") || hashParams.get("code");

        if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === "recovery" ? "recovery" : "email",
          });
          if (error) {
            markInvalid(error.message);
            return;
          }
          window.history.replaceState({}, "", url.pathname);
          markReady();
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            markInvalid(error.message);
            return;
          }
          window.history.replaceState({}, "", url.pathname);
          markReady();
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          markReady();
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, nextSession) => {
          if (
            (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") &&
            nextSession
          ) {
            markReady();
          }
        });
        unsubscribe = () => subscription.unsubscribe();

        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;
        const again = await supabase.auth.getSession();
        if (again.data.session) {
          markReady();
        } else {
          markInvalid();
        }
      } catch (err) {
        markInvalid(
          err instanceof Error
            ? err.message
            : "No pudimos validar el enlace de recuperación.",
        );
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => {
        router.replace(loginHref());
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <img className="logo" src="/nexolia-logo.svg" alt="Nexolia" />
      <div className="portal-label">Admin Portal</div>
      <h1 style={{ marginBottom: "0.35rem" }}>Nueva contraseña</h1>
      <p
        className="secondary"
        style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}
      >
        Elegí una contraseña nueva para tu cuenta de staff.
      </p>

      {error && <p className="login-error">{error}</p>}
      {done && (
        <p
          className="secondary"
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 0.9rem",
            borderRadius: 10,
            background: "rgba(8, 189, 102, 0.12)",
            color: "#0a5c38",
            fontSize: "0.9rem",
          }}
        >
          Contraseña actualizada. Te llevamos al login…
        </p>
      )}

      {ready && !done && (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      )}

      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.8rem" }}>
        <Link href={loginHref()}>← Volver al login</Link>
      </p>
    </div>
  );
}
