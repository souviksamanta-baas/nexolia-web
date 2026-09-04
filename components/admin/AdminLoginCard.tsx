"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { adminApi } from "@/lib/api";

/**
 * Staff login (email/password). Google OAuth is deferred.
 * Password reset goes through Nest + Resend (Spanish email).
 */
export function AdminLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await fetch("/api/public/admin/password-reset", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmed }),
        cache: "no-store",
      });
      const raw = await res.text();
      let parsed: unknown = raw;
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          /* keep text */
        }
      }
      if (!res.ok) {
        const message =
          parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          (parsed as { message: unknown }).message
            ? String((parsed as { message: unknown }).message)
            : "No pudimos enviar el correo de recuperación.";
        throw new Error(message);
      }
      setInfo(
        "Te enviamos un correo para restablecer la contraseña. Revisá tu bandeja (y spam).",
      );
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setError(raw || "No pudimos enviar el correo de recuperación.");
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
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.5 5.5 12 5.5 21.5 12 21.5 12 17.5 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.7a3.2 3.2 0 0 0 4.5 4.5M6.1 6.3C4.1 7.6 2.5 12 2.5 12S6.5 18.5 12 18.5c1.7 0 3.2-.4 4.5-1M9.9 5.7C10.6 5.6 11.3 5.5 12 5.5 17.5 5.5 21.5 12 21.5 12c-.5.9-1.2 1.9-2.1 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
