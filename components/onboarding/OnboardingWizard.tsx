"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { submitPublicLead, type BillingCycle, ApiError } from "@/lib/api";
import { formatARS } from "@/lib/formatters";
import {
  FEATURE_SERVICE_OPTIONS,
  buildLeadFeatureFlags,
  defaultSelectedFeatureKeys,
  featureOptionTitle,
  type FeatureFlagKey,
} from "@/lib/feature-catalog";

/* ------------------------------------------------------------------ */
/* Static content                                                     */
/* ------------------------------------------------------------------ */

const CATEGORIAS = [
  "Ferretería",
  "Dietética",
  "Clínica",
  "Veterinaria",
  "Restaurante",
  "Taller",
  "Servicios profesionales",
] as const;

const SERVICE_GROUPS = Array.from(
  new Set(FEATURE_SERVICE_OPTIONS.map((o) => o.group)),
);

interface Plan {
  id: "starter" | "basico" | "pro";
  name: string;
  monthly: number;
  annual: number;
  tagline: string;
  featured?: boolean;
}

// Annual price = monthly * 12 * 0.85 (−15%), rounded to nearest 100.
const PLANS: Plan[] = [
  { id: "starter", name: "Starter", monthly: 29_000, annual: 295_800, tagline: "1 usuario · reportes básicos" },
  { id: "basico", name: "Básico", monthly: 69_000, annual: 703_800, tagline: "Hasta 5 usuarios · stock + ventas", featured: true },
  { id: "pro", name: "Pro", monthly: 149_000, annual: 1_519_800, tagline: "Ilimitado · todos los módulos" },
];

const TRANSFER = {
  cbu: "00701234-0123456789012345-6",
  alias: "NEXOLIA.PAGOS",
  titular: "Nexolia SRL · CUIT 30-71234567-8",
  efectivo: "Av. Colón 1234, Córdoba · Lun a Vie 9–18 h",
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Step = 1 | 2 | 3 | 4;

interface FormState {
  email: string;
  categoria: (typeof CATEGORIAS)[number] | "";
  /** Selected OrganizationFeatureFlags keys */
  servicios: FeatureFlagKey[];
  plan: Plan["id"];
  ciclo: BillingCycle;
}

const initialState: FormState = {
  email: "",
  categoria: "",
  servicios: defaultSelectedFeatureKeys(),
  plan: "basico",
  ciclo: "monthly",
};

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === form.plan) ?? PLANS[1],
    [form.plan],
  );

  const totalDisplay = useMemo(() => {
    const amount = form.ciclo === "annual" ? selectedPlan.annual : selectedPlan.monthly;
    return `${formatARS(amount)} ${form.ciclo === "annual" ? "/ año" : "/ mes"}`;
  }, [form.ciclo, selectedPlan]);

  const toggleService = (id: FeatureFlagKey) => {
    setForm((f) => ({
      ...f,
      servicios: f.servicios.includes(id)
        ? f.servicios.filter((s) => s !== id)
        : [...f.servicios, id],
    }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const featureFlags = buildLeadFeatureFlags(form.servicios);
      const res = await submitPublicLead({
        email: form.email,
        categoria: form.categoria,
        servicios: form.servicios,
        featureFlags,
        plan: form.plan,
        ciclo: form.ciclo,
        source: "nexolia-web/comenzar",
      });
      setLeadId(res.id ?? "pendiente");
      setStep(4);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "No pudimos enviar tu solicitud. Intentá de nuevo en unos minutos.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StepsBar step={step} />

      <div className="onboard-layout">
        <RailList step={step} form={form} selectedPlan={selectedPlan} />

        <div className="onboard-main-inner">
          <div className="onboard-card">
            {step === 1 && (
              <StepBusiness
                form={form}
                setForm={setForm}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepServices
                form={form}
                toggleService={toggleService}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepPlan
                form={form}
                setForm={setForm}
                submitting={submitting}
                error={error}
                onBack={() => setStep(2)}
                onSubmit={submit}
              />
            )}
            {step === 4 && (
              <ThanksPanel
                email={form.email}
                total={totalDisplay}
                planName={selectedPlan.name}
                leadId={leadId}
                onReset={() => {
                  setForm(initialState);
                  setStep(1);
                  setLeadId(null);
                  setError(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Rail + steps                                                        */
/* ------------------------------------------------------------------ */

function StepsBar({ step }: { step: Step }) {
  const items: { label: string; index: Step }[] = [
    { label: "Tu negocio", index: 1 },
    { label: "Servicios", index: 2 },
    { label: "Plan", index: 3 },
    { label: "Confirmación", index: 4 },
  ];
  return (
    <ol className="steps">
      {items.map((it) => (
        <li
          key={it.index}
          className={
            step === it.index ? "is-current" : step > it.index ? "is-done" : ""
          }
        >
          {it.label}
        </li>
      ))}
    </ol>
  );
}

function RailList({
  step,
  form,
  selectedPlan,
}: {
  step: Step;
  form: FormState;
  selectedPlan: Plan;
}) {
  const serviciosLabel =
    form.servicios.length === 0
      ? "Servicios · pendiente"
      : `${form.servicios.length} módulos · ${form.servicios
          .slice(0, 3)
          .map((id) => featureOptionTitle(id))
          .join(", ")}${form.servicios.length > 3 ? "…" : ""}`;

  const planLabel =
    step >= 4
      ? `Plan ${selectedPlan.name} · ${formatARS(
          form.ciclo === "annual" ? selectedPlan.annual : selectedPlan.monthly,
        )}${form.ciclo === "annual" ? "/año" : "/mes"}`
      : "Plan · pendiente";

  return (
    <aside className="onboard-rail">
      <h2>Tu información</h2>
      <ul className="rail-list">
        <li className={form.email ? "is-done" : step === 1 ? "is-current" : ""}>
          {form.email || "Datos de contacto"}
        </li>
        <li
          className={
            form.categoria
              ? "is-done"
              : step === 1
              ? "is-current"
              : ""
          }
        >
          {form.categoria || "Categoría del negocio"}
        </li>
        <li
          className={
            step >= 3 ? "is-done" : step === 2 ? "is-current" : ""
          }
        >
          {step >= 2 ? serviciosLabel : "Servicios · pendiente"}
        </li>
        <li className={step === 4 ? "is-done" : step === 3 ? "is-current" : ""}>
          {planLabel}
        </li>
      </ul>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — business                                                   */
/* ------------------------------------------------------------------ */

function StepBusiness({
  form,
  setForm,
  onNext,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onNext: () => void;
}) {
  return (
    <>
      <h1>Contanos sobre tu negocio</h1>
      <p className="secondary">
        Paso 1 de 3 — empezamos con lo básico para armar tu cuenta.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@negocio.com.ar"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <span className="hint">
            Te enviaremos la confirmación y datos de pago acá.
          </span>
        </div>
        <div className="field">
          <label htmlFor="categoria">Categoría del negocio</label>
          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                categoria: e.target.value as FormState["categoria"],
              }))
            }
            required
          >
            <option value="" disabled>
              Elegí una categoría
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="onboard-actions">
          <span />
          <button className="btn btn-primary" type="submit">
            Continuar →
          </button>
        </div>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — services                                                   */
/* ------------------------------------------------------------------ */

function StepServices({
  form,
  toggleService,
  onBack,
  onNext,
}: {
  form: FormState;
  toggleService: (id: FeatureFlagKey) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <h1>¿Qué módulos necesitás?</h1>
      <p className="secondary">
        Paso 2 de 3 — cada opción es un feature flag de la app Nexolia. Lo que
        marques se activa al convertir el lead.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {SERVICE_GROUPS.map((group) => (
          <div key={group}>
            <h3 className="service-group-title">{group}</h3>
            <div className="service-grid">
              {FEATURE_SERVICE_OPTIONS.filter((svc) => svc.group === group).map(
                (svc) => {
                  const selected = form.servicios.includes(svc.key);
                  return (
                    <label
                      key={svc.key}
                      className={`service-card${selected ? " is-selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="svc"
                        value={svc.key}
                        checked={selected}
                        onChange={() => toggleService(svc.key)}
                      />
                      <div>
                        <strong>{svc.title}</strong>
                        <span>
                          {svc.key} · {svc.description}
                        </span>
                      </div>
                    </label>
                  );
                },
              )}
            </div>
          </div>
        ))}

        <div className="onboard-actions">
          <button className="btn btn-secondary" type="button" onClick={onBack}>
            ← Volver
          </button>
          <button className="btn btn-primary" type="submit">
            Continuar →
          </button>
        </div>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — plan                                                       */
/* ------------------------------------------------------------------ */

function StepPlan({
  form,
  setForm,
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1>Elegí tu plan</h1>
      <p className="secondary">
        Paso 3 de 3 — pagás por transferencia o efectivo. Activamos tu cuenta al confirmar el pago.
      </p>

      <div className="billing-toggle" role="group" aria-label="Período de facturación">
        <button
          type="button"
          className={form.ciclo === "monthly" ? "is-active" : ""}
          onClick={() => setForm((f) => ({ ...f, ciclo: "monthly" }))}
        >
          Mensual
        </button>
        <button
          type="button"
          className={form.ciclo === "annual" ? "is-active" : ""}
          onClick={() => setForm((f) => ({ ...f, ciclo: "annual" }))}
        >
          Anual{" "}
          <span className="badge badge-green" style={{ marginLeft: "0.25rem" }}>
            −15%
          </span>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="onboard-plans">
          {PLANS.map((plan) => {
            const selected = form.plan === plan.id;
            const price = form.ciclo === "annual" ? plan.annual : plan.monthly;
            return (
              <label
                key={plan.id}
                className={`onboard-plan${selected ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selected}
                  onChange={() =>
                    setForm((f) => ({ ...f, plan: plan.id }))
                  }
                  className="sr-only"
                />
                <div className="name">{plan.name}</div>
                <div className="price">
                  {formatARS(price)}{" "}
                  <small>{form.ciclo === "annual" ? "/ año" : "/ mes"}</small>
                </div>
                <p
                  className="muted"
                  style={{ fontSize: "0.8rem", margin: "0.5rem 0 0" }}
                >
                  {plan.tagline}
                </p>
              </label>
            );
          })}
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="onboard-actions">
          <button className="btn btn-secondary" type="button" onClick={onBack} disabled={submitting}>
            ← Volver
          </button>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Enviando…" : "Confirmar pedido →"}
          </button>
        </div>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — thanks                                                     */
/* ------------------------------------------------------------------ */

function ThanksPanel({
  email,
  total,
  planName,
  leadId,
  onReset,
}: {
  email: string;
  total: string;
  planName: string;
  leadId: string | null;
  onReset: () => void;
}) {
  return (
    <>
      <div className="thanks-box">
        <div className="check" aria-hidden="true">
          ✓
        </div>
        <h1>¡Gracias por tu pedido!</h1>
        <p className="secondary">
          Recibimos tu solicitud del plan <strong>{planName}</strong>. Te
          enviamos un correo a <strong>{email}</strong> con los detalles.
        </p>
        <p className="secondary">
          Activamos tu cuenta cuando confirmemos el pago (usualmente en menos de 24 h).
        </p>
        {leadId && (
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            Referencia: <code>{leadId}</code>
          </p>
        )}
      </div>

      <div className="transfer-box">
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Datos para pagar</h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Podés abonar por <strong>transferencia bancaria</strong> o en{" "}
          <strong>efectivo</strong> en nuestra oficina. Indicá tu correo como referencia.
        </p>
        <dl>
          <dt>Total a pagar</dt>
          <dd style={{ fontSize: "1.25rem", color: "var(--primary-dark)" }}>{total}</dd>
          <dt>Transferencia — CBU</dt>
          <dd>{TRANSFER.cbu}</dd>
          <dt>Alias</dt>
          <dd>{TRANSFER.alias}</dd>
          <dt>Titular</dt>
          <dd>{TRANSFER.titular}</dd>
          <dt>Efectivo</dt>
          <dd>{TRANSFER.efectivo}</dd>
        </dl>
      </div>

      <div className="onboard-actions" style={{ marginTop: "1.5rem" }}>
        <button className="btn btn-secondary" type="button" onClick={onReset}>
          Nuevo pedido
        </button>
        <Link className="btn btn-primary" href="/">
          Volver al inicio
        </Link>
      </div>
    </>
  );
}
