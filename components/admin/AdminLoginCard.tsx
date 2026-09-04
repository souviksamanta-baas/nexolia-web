"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { adminApi } from "@/lib/api";

export function AdminLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("No se pudo obtener la sesión.");

      // Gate against Nest /admin/me — non-staff accounts get bounced out.
      try {
        await adminApi.me(token);
      } catch {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta no tiene acceso al portal Nexolia Admin.");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo =
        (typeof window !== "undefined" &&
          `${window.location.origin}/admin/login`) ||
        undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar con Google.");
      setGoogleLoading(false);
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

      <button
        type="button"
        className="login-google"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
      >
        <GoogleIcon /> {googleLoading ? "Redirigiendo…" : "Continuar con Google"}
      </button>

      <div className="login-divider">o con contraseña</div>

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
          <a href="#" style={{ fontSize: "0.85rem" }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Ingresando…" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.8rem" }}>
        <Link href="/">← Volver al sitio</Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.1.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.9 6.1C12.5 13.3 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6L2.6 13.3C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.3 2.2-6.4 0-11.8-3.8-13.7-9.2l-7.9 6.1C6.5 42.1 14.6 48 24 48z"
      />
    </svg>
  );
}
