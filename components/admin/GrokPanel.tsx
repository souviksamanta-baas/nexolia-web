"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { adminApi, type GrokChatMessage } from "@/lib/api";

const CHIPS = [
  "Leads pendientes",
  "Pagos por confirmar",
  "Orgs sin owner",
  "Licencias por vencer",
] as const;

const INITIAL_MESSAGES: GrokChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hola. Hay 3 leads pendientes de contacto esta semana y 7 pagos esperando confirmación.",
  },
];

export function GrokPanel() {
  const [messages, setMessages] = useState<GrokChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [activeChip, setActiveChip] = useState<string>(CHIPS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  const send = useCallback(
    async (prompt: string, chipUsed?: string) => {
      setBusy(true);
      setError(null);
      const userMsg: GrokChatMessage = { role: "user", content: prompt };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Sesión expirada. Volvé a iniciar sesión.");

        const res = await adminApi.grokChat(token, {
          messages: next,
          chip: chipUsed,
        });
        setMessages((prev) => [...prev, res.message]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pude responder.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "No pude conectarme al backend en este momento. Probá de nuevo en unos segundos.",
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages],
  );

  const handleChip = (chip: string) => {
    setActiveChip(chip);
    void send(`Mostrame ${chip.toLowerCase()}`, chip);
  };

  return (
    <aside className="grok-panel" aria-label="Asistente Grok">
      <div className="grok-panel-header">
        <h2>
          <SparkIcon /> Asistente Grok
        </h2>
        <Link className="btn btn-ghost btn-sm" href="/admin/dashboard" aria-label="Cerrar panel">
          ✕
        </Link>
      </div>
      <div className="grok-chips">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`chip${activeChip === chip ? " is-active" : ""}`}
            onClick={() => handleChip(chip)}
            disabled={busy}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="grok-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`msg ${m.role === "user" ? "msg-user" : "msg-bot"}`}
          >
            {m.content}
          </div>
        ))}
        {error && (
          <div className="msg msg-bot" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        )}
      </div>
      <form
        className="grok-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) void send(input.trim());
        }}
      >
        <input
          type="text"
          placeholder="Preguntale a Grok…"
          aria-label="Mensaje para Grok"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!canSend}>
          {busy ? "…" : "Enviar"}
        </button>
      </form>
    </aside>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.2 6.3L19 12l-5.8 3.7L12 22l-1.2-6.3L5 12l5.8-3.7L12 2z" />
    </svg>
  );
}
