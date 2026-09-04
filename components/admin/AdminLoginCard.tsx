"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { adminApi } from "@/lib/api";

function recoveryRedirectTo(): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const host = window.location.hostname.toLowerCase();
  return host.startsWith("admin.")
    ? `${origin}/reset-password`
    : `${origin}/admin/reset-password`;
}

/**
 * Staff login (email/password). Google OAuth is deferred.
 */
export function AdminLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token || cancelled) {
          return;
        }
        await adminApi.me(session.access_token);
        if (!cancelled) {
          router.replace("/admin/dashboard");
          router.refresh();
        }
      } catch {
        try {
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.signOut();
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("No se pudo obtener la sesión.");

      try {
        await adminApi.me(token);
      } catch {
        await supabase.auth.signOut();
        throw new Error(
          "Tu cuenta no tiene acceso al portal Nexolia Admin. Pedí una invitación al equipo.",
        );
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = raw.includes("Supabase env vars missing")
        ? "Falta la configuración de Supabase en el servidor. Probá de nuevo en unos minutos."
        : raw || "No pudimos iniciar sesión.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresá tu correo y después tocá «¿Olvidaste tu contraseña?».");
      return;
    }

    setResetting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: recoveryRedirectTo(),
      });
      if (error) throw error;
      setInfo(
        "Te enviamos un correo para restablecer la contraseña. Revisá tu bandeja (y spam).",
      );
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = raw.includes("Supabase env vars missing")
        ? "Falta la configuración de Supabase en el servidor. Probá de nuevo en unos minutos."
        : raw || "No pudimos enviar el correo de recuperación.";
      setError(message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="login-card">
      <img className="logo" src="/nexolia-logo.svg" alt="Nexolia" />
      <div className="portal-label">Admin Portal</div>
      <h1 style={{ marginBottom: "0.35rem" }}>Iniciar sesión</h1>
      <p
        className="secondary"
        style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}
      >
        Acceso exclusivo para el equipo Nexolia.
      </p>

      {error && <p className="login-error">{error}</p>}
      {info && (
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
          {info}
        </p>
      )}

      <form onSubmit={handlePassword}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@nexolia.com.ar"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div
          className="field"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <label
            style={{
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" defaultChecked /> Recordarme
          </label>
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            disabled={resetting || loading}
            style={{
              fontSize: "0.85rem",
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--nx-green, #08bd66)",
              cursor: resetting ? "wait" : "pointer",
              textDecoration: "underline",
            }}
          >
            {resetting ? "Enviando…" : "¿Olvidaste tu contraseña?"}
          </button>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Ingresando…" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.8rem" }}>
        <Link href="https://nexolia.com.ar/">← Volver al sitio</Link>
      </p>
    </div>
  );
}
