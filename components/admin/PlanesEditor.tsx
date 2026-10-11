"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, ApiError, type AdminPlan } from "@/lib/api";
import { formatARS } from "@/lib/formatters";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Draft = {
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  tagline: string;
  serviciosText: string;
  copiText: string;
  featured: boolean;
  customPriceLabel: string;
};

function toDraft(plan: AdminPlan): Draft {
  return {
    name: plan.name,
    priceMonthly:
      plan.priceMonthly != null && plan.priceMonthly > 0
        ? String(plan.priceMonthly)
        : "",
    priceAnnual:
      plan.priceAnnual != null && plan.priceAnnual > 0
        ? String(plan.priceAnnual)
        : "",
    tagline: plan.tagline ?? "",
    serviciosText: (plan.servicios ?? []).join("\n"),
    copiText: (plan.copi ?? []).join("\n"),
    featured: Boolean(plan.featured),
    customPriceLabel: plan.customPriceLabel ?? "",
  };
}

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function PlanesEditor({ plans: initialPlans }: { plans: AdminPlan[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [plans, setPlans] = useState(initialPlans);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialPlans.map((p) => [p.id, toDraft(p)])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const ordered = useMemo(
    () =>
      [...plans].sort((a, b) => {
        const order = ["basico", "pro", "enterprise"];
        return order.indexOf(a.slug ?? "") - order.indexOf(b.slug ?? "");
      }),
    [plans],
  );

  const startEdit = () => {
    setDrafts(Object.fromEntries(plans.map((p) => [p.id, toDraft(p)])));
    setError(null);
    setOk(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const next = { ...current, ...patch };
      if (
        patch.priceMonthly !== undefined &&
        !next.customPriceLabel.trim() &&
        next.priceMonthly.trim()
      ) {
        const monthly = Number(next.priceMonthly.replace(/\D/g, ""));
        if (Number.isFinite(monthly) && monthly > 0) {
          next.priceAnnual = String(monthly * 11);
        }
      }
      return { ...prev, [id]: next };
    });
  };

  const onSave = async () => {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      }

      const updated: AdminPlan[] = [];
      for (const plan of ordered) {
        const draft = drafts[plan.id];
        if (!draft) continue;
        const customPriceLabel = draft.customPriceLabel.trim() || null;
        const priceMonthly = customPriceLabel
          ? 0
          : Number(draft.priceMonthly.replace(/\D/g, "")) || 0;
        const priceAnnual = customPriceLabel
          ? 0
          : Number(draft.priceAnnual.replace(/\D/g, "")) || priceMonthly * 11;
        const result = await adminApi.updatePlan(token, plan.id, {
          name: draft.name.trim(),
          priceMonthly,
          priceAnnual,
          tagline: draft.tagline.trim(),
          servicios: linesToList(draft.serviciosText),
          copi: linesToList(draft.copiText),
          featured: draft.featured,
          customPriceLabel,
        });
        updated.push({ ...result, slug: result.slug ?? plan.slug });
      }
      setPlans(updated);
      setEditing(false);
      setOk("Planes guardados. /comenzar ya usa estos datos.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudieron guardar los planes.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Planes y suscripciones</h1>
          <p>Catálogo comercial de /comenzar · Básico, Pro y Enterprise</p>
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              disabled={busy}
              onClick={cancelEdit}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              disabled={busy}
              onClick={() => void onSave()}
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={startEdit}
          >
            Editar
          </button>
        )}
      </div>

      {error ? <p className="login-error">{error}</p> : null}
      {ok ? (
        <p className="muted" style={{ color: "var(--primary-dark)" }}>
          {ok}
        </p>
      ) : null}

      <div className="plans-grid">
        {ordered.map((plan) => {
          const draft = drafts[plan.id] ?? toDraft(plan);
          const showCustom = Boolean(
            editing
              ? draft.customPriceLabel.trim()
              : plan.customPriceLabel?.trim(),
          );
          const priceMonthly = editing
            ? Number(draft.priceMonthly.replace(/\D/g, "")) || 0
            : plan.priceMonthly;
          const servicios = editing
            ? linesToList(draft.serviciosText)
            : (plan.servicios ?? []);
          const copi = editing ? linesToList(draft.copiText) : (plan.copi ?? []);
          const featured = editing ? draft.featured : Boolean(plan.featured);
          const name = editing ? draft.name : plan.name;
          const tagline = editing ? draft.tagline : (plan.tagline ?? "");

          return (
            <div
              key={plan.id}
              className={`plan-card${featured ? " featured" : ""}`}
            >
              {featured ? (
                <span
                  className="badge badge-green"
                  style={{ position: "absolute", top: "1rem", right: "1rem" }}
                >
                  Popular
                </span>
              ) : null}

              {editing ? (
                <div className="field" style={{ marginBottom: "0.75rem" }}>
                  <label htmlFor={`name-${plan.id}`}>Nombre</label>
                  <input
                    id={`name-${plan.id}`}
                    value={draft.name}
                    onChange={(e) =>
                      updateDraft(plan.id, { name: e.target.value })
                    }
                    disabled={busy}
                  />
                </div>
              ) : (
                <div className="plan-name">{name}</div>
              )}

              {editing ? (
                <>
                  <div className="field" style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor={`custom-${plan.id}`}>
                      Precio a medida (opcional)
                    </label>
                    <input
                      id={`custom-${plan.id}`}
                      value={draft.customPriceLabel}
                      placeholder="Ej. Precio a medida"
                      onChange={(e) =>
                        updateDraft(plan.id, {
                          customPriceLabel: e.target.value,
                        })
                      }
                      disabled={busy}
                    />
                  </div>
                  {!draft.customPriceLabel.trim() ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div className="field" style={{ margin: 0 }}>
                        <label htmlFor={`monthly-${plan.id}`}>Mensual</label>
                        <input
                          id={`monthly-${plan.id}`}
                          inputMode="numeric"
                          value={draft.priceMonthly}
                          onChange={(e) =>
                            updateDraft(plan.id, {
                              priceMonthly: e.target.value,
                            })
                          }
                          disabled={busy}
                        />
                      </div>
                      <div className="field" style={{ margin: 0 }}>
                        <label htmlFor={`annual-${plan.id}`}>
                          Anual (11 meses)
                        </label>
                        <input
                          id={`annual-${plan.id}`}
                          inputMode="numeric"
                          value={draft.priceAnnual}
                          onChange={(e) =>
                            updateDraft(plan.id, {
                              priceAnnual: e.target.value,
                            })
                          }
                          disabled={busy}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="plan-price">
                  {showCustom ? (
                    <small style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      {plan.customPriceLabel}
                    </small>
                  ) : (
                    <>
                      {formatARS(priceMonthly ?? 0)} <span>/ mes</span>
                    </>
                  )}
                </div>
              )}

              {editing ? (
                <div className="field" style={{ marginBottom: "0.75rem" }}>
                  <label htmlFor={`tagline-${plan.id}`}>Tagline</label>
                  <input
                    id={`tagline-${plan.id}`}
                    value={draft.tagline}
                    onChange={(e) =>
                      updateDraft(plan.id, { tagline: e.target.value })
                    }
                    disabled={busy}
                  />
                </div>
              ) : tagline ? (
                <p
                  className="muted"
                  style={{ fontSize: "0.85rem", margin: "0.35rem 0 0.75rem" }}
                >
                  {tagline}
                </p>
              ) : null}

              {editing ? (
                <>
                  <div className="field" style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor={`servicios-${plan.id}`}>
                      Servicios (una línea por ítem)
                    </label>
                    <textarea
                      id={`servicios-${plan.id}`}
                      rows={5}
                      value={draft.serviciosText}
                      onChange={(e) =>
                        updateDraft(plan.id, { serviciosText: e.target.value })
                      }
                      disabled={busy}
                    />
                  </div>
                  <div className="field" style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor={`copi-${plan.id}`}>
                      Copi (una línea por ítem)
                    </label>
                    <textarea
                      id={`copi-${plan.id}`}
                      rows={5}
                      value={draft.copiText}
                      onChange={(e) =>
                        updateDraft(plan.id, { copiText: e.target.value })
                      }
                      disabled={busy}
                    />
                  </div>
                  <label
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) =>
                        updateDraft(plan.id, { featured: e.target.checked })
                      }
                      disabled={busy}
                    />
                    Destacar como Popular
                  </label>
                </>
              ) : (
                <>
                  {servicios.length > 0 ? (
                    <>
                      <div
                        className="muted"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          marginBottom: "0.35rem",
                        }}
                      >
                        Servicios
                      </div>
                      <ul>
                        {servicios.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {copi.length > 0 ? (
                    <>
                      <div
                        className="muted"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          margin: "0.75rem 0 0.35rem",
                        }}
                      >
                        Copi
                      </div>
                      <ul>
                        {copi.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
