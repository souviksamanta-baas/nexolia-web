"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  checkOrgName,
  submitPublicLead,
  type BillingCycle,
  ApiError,
} from "@/lib/api";
import { formatARS } from "@/lib/formatters";
import {
  FEATURE_SERVICE_OPTIONS,
  COPI_PRO_BULLETS,
  COPI_TIER_OPTIONS,
  SUPPORT_WHATSAPP_URL,
  applyCopiTierSelection,
  buildLeadFeatureFlags,
  copiTierFromSelection,
  defaultSelectedFeatureKeys,
  featureOptionTitle,
  hasCopiProSelection,
  planIncludesCopiPro,
  selectableServiceKeys,
  type CopiTierId,
  type FeatureFlagKey,
  type FeatureServiceOption,
} from "@/lib/feature-catalog";

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
  id: "basico" | "pro" | "enterprise";
  name: string;
  monthly: number | null;
  annual: number | null;
  tagline: string;
  servicios: string[];
  copi: string[];
  featured?: boolean;
  /** When set, show this instead of a $ price (e.g. Enterprise). */
  customPriceLabel?: string;
}

/** Segmentos de módulos incluidos en todos los planes. */
const PLAN_SERVICIOS = [
  "Comercio",
  "Facturación",
  "Agenda",
  "Canales",
] as const;

const COPI_BASIC_PLAN_FEATURES = [
  "Copi básico (5 preguntas preconfiguradas)",
] as const;

/** Suscripciones: Básico/Pro gratuitas por ahora; Enterprise a medida. */
const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    monthly: 0,
    annual: 0,
    tagline: "Hasta 5 usuarios",
    featured: true,
    servicios: [...PLAN_SERVICIOS],
    copi: [...COPI_BASIC_PLAN_FEATURES],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 0,
    annual: 0,
    tagline: "Hasta 10 usuarios · 1 sucursal",
    servicios: [...PLAN_SERVICIOS],
    copi: [...COPI_PRO_BULLETS],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    annual: null,
    tagline: "Usuarios ilimitados · Multisucursal",
    customPriceLabel: "Precio a medida",
    servicios: [...PLAN_SERVICIOS, "Multisucursal", "Usuarios ilimitados"],
    copi: [...COPI_PRO_BULLETS],
  },
];

const INACTIVITY_NOTE =
  "Si tu organización permanece inactiva durante 30 días, puede eliminarse automáticamente.";

/**
 * Keep Copi tier and plan in sync:
 * - Copi Pro → at least plan Pro (keep Enterprise if already chosen)
 * - Plan Pro / Enterprise → Copi Pro (plan entitlement)
 */
function syncPlanAndCopi(form: FormState): FormState {
  let next = form;

  if (hasCopiProSelection(next.servicios)) {
    if (next.plan !== "pro" && next.plan !== "enterprise") {
      next = { ...next, plan: "pro" };
    }
  }

  if (planIncludesCopiPro(next.plan) && !hasCopiProSelection(next.servicios)) {
    next = {
      ...next,
      servicios: applyCopiTierSelection(next.servicios, "pro"),
    };
  }

  return next;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface FormState {
  email: string;
  orgName: string;
  categoria: (typeof CATEGORIAS)[number] | "";
  servicios: FeatureFlagKey[];
  plan: Plan["id"];
  ciclo: BillingCycle;
}

const initialState: FormState = {
  email: "",
  orgName: "",
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
    () => PLANS.find((p) => p.id === form.plan) ?? PLANS[0],
    [form.plan],
  );

  const toggleService = (id: FeatureFlagKey) => {
    setForm((f) => {
      const servicios = f.servicios.includes(id)
        ? f.servicios.filter((s) => s !== id)
        : [...f.servicios, id];
      return syncPlanAndCopi({ ...f, servicios });
    });
  };

  const setServiceSelection = (keys: FeatureFlagKey[], selected: boolean) => {
    setForm((f) => {
      const set = new Set(f.servicios);
      for (const key of keys) {
        if (selected) set.add(key);
        else set.delete(key);
      }
      return syncPlanAndCopi({
        ...f,
        servicios: Array.from(set),
      });
    });
  };

  const setCopiTier = (tier: CopiTierId) => {
    setForm((f) => {
      // Choosing Copi básico while on Pro/Enterprise keeps the plan but Copi
      // stays Pro (plan entitlement). Downgrade plan first if they want básico.
      if (tier === "basic" && planIncludesCopiPro(f.plan)) {
        return syncPlanAndCopi({
          ...f,
          plan: "basico",
          servicios: applyCopiTierSelection(f.servicios, "basic"),
        });
      }
      return syncPlanAndCopi({
        ...f,
        servicios: applyCopiTierSelection(f.servicios, tier),
      });
    });
  };

  const setPlan = (plan: Plan["id"]) => {
    setForm((f) => syncPlanAndCopi({ ...f, plan }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const featureFlags = buildLeadFeatureFlags(form.servicios, form.plan);
      const res = await submitPublicLead({
        email: form.email,
        orgName: form.orgName,
        categoria: form.categoria,
        servicios: form.servicios,
        featureFlags,
        plan: form.plan,
        ciclo: form.ciclo,
        source: "nexolia-web/comenzar",
      });
      setLeadId(res.id ?? "pendiente");
      setStep(5);
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
                setServiceSelection={setServiceSelection}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepCopi
                form={form}
                setCopiTier={setCopiTier}
                onBack={() => setStep(2)}
                onNext={() => {
                  setForm((f) => syncPlanAndCopi(f));
                  setStep(4);
                }}
              />
            )}
            {step === 4 && (
              <StepPlan
                form={form}
                setPlan={setPlan}
                setCiclo={(ciclo) => setForm((f) => ({ ...f, ciclo }))}
                submitting={submitting}
                error={error}
                onBack={() => setStep(3)}
                onSubmit={submit}
              />
            )}
            {step === 5 && (
              <ThanksPanel
                email={form.email}
                orgName={form.orgName}
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

function StepsBar({ step }: { step: Step }) {
  const items: { label: string; index: Step }[] = [
    { label: "Tu negocio", index: 1 },
    { label: "Servicios", index: 2 },
    { label: "Copi", index: 3 },
    { label: "Plan", index: 4 },
    { label: "Confirmación", index: 5 },
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
  const serviceKeys = form.servicios.filter((k) =>
    selectableServiceKeys().includes(k),
  );
  const copiTier = copiTierFromSelection(form.servicios);

  const serviciosLabel =
    serviceKeys.length === 0
      ? "Servicios · pendiente"
      : `${serviceKeys.length} módulos · ${serviceKeys
          .slice(0, 3)
          .map((id) => featureOptionTitle(id))
          .join(", ")}${serviceKeys.length > 3 ? "…" : ""}`;

  const copiLabel =
    copiTier === "pro" ? "Copi · Copi Pro" : "Copi · Copi básico";

  const planLabel =
    step >= 5
      ? selectedPlan.customPriceLabel
        ? `Plan ${selectedPlan.name} · a medida`
        : `Plan ${selectedPlan.name} · suscripción gratuita`
      : "Plan · pendiente";

  return (
    <aside className="onboard-rail">
      <h2>Tu información</h2>
      <ul className="rail-list">
        <li className={form.orgName ? "is-done" : step === 1 ? "is-current" : ""}>
          {form.orgName || "Nombre del negocio"}
        </li>
        <li className={form.email ? "is-done" : step === 1 ? "is-current" : ""}>
          {form.email || "Datos de contacto"}
        </li>
        <li
          className={
            form.categoria ? "is-done" : step === 1 ? "is-current" : ""
          }
        >
          {form.categoria || "Categoría del negocio"}
        </li>
        <li className={step >= 3 ? "is-done" : step === 2 ? "is-current" : ""}>
          {step >= 2 ? serviciosLabel : "Servicios · pendiente"}
        </li>
        <li className={step >= 4 ? "is-done" : step === 3 ? "is-current" : ""}>
          {step >= 3 ? copiLabel : "Copi · pendiente"}
        </li>
        <li className={step === 5 ? "is-done" : step === 4 ? "is-current" : ""}>
          {planLabel}
        </li>
      </ul>
    </aside>
  );
}

function StepBusiness({
  form,
  setForm,
  onNext,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onNext: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [ownedByMe, setOwnedByMe] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setOwnedByMe(false);
    setChecking(true);
    try {
      const result = await checkOrgName({
        name: form.orgName.trim(),
        email: form.email.trim(),
      });
      if (!result.available) {
        setOwnedByMe(result.ownedByRequester);
        setNameError(
          result.ownedByRequester
            ? `El negocio «${result.orgName}» ya está registrado con tu correo.`
            : `El negocio «${result.orgName}» ya está registrado.`,
        );
        return;
      }
      onNext();
    } catch (err) {
      setNameError(
        err instanceof ApiError
          ? err.message
          : "No pudimos verificar el nombre. Intentá de nuevo.",
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <h1>Contanos sobre tu negocio</h1>
      <p className="secondary">
        Paso 1 de 4 — empezamos con lo básico para armar tu cuenta.
      </p>
      <form onSubmit={(e) => void handleNext(e)}>
        <div className="field">
          <label htmlFor="orgName">Nombre del negocio</label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            placeholder="Ej. Ferretería Villalba"
            value={form.orgName}
            onChange={(e) => {
              setNameError(null);
              setOwnedByMe(false);
              setForm((f) => ({ ...f, orgName: e.target.value }));
            }}
            required
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@negocio.com.ar"
            value={form.email}
            onChange={(e) => {
              setNameError(null);
              setOwnedByMe(false);
              setForm((f) => ({ ...f, email: e.target.value }));
            }}
            required
          />
          <span className="hint">
            Te enviaremos la confirmación de alta a este correo.
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

        {nameError && (
          <div className="login-error" style={{ marginBottom: "1rem" }}>
            <p style={{ margin: 0 }}>{nameError}</p>
            {ownedByMe && (
              <p style={{ margin: "0.65rem 0 0", fontSize: "0.9rem" }}>
                Si necesitás ayuda, escribinos por{" "}
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                .
              </p>
            )}
          </div>
        )}

        <p className="hint" style={{ marginBottom: "1.25rem" }}>
          {INACTIVITY_NOTE}{" "}
          <Link href="/privacidad">Ver política de privacidad</Link>.
        </p>

        <div className="onboard-actions">
          <span />
          <button className="btn btn-primary" type="submit" disabled={checking}>
            {checking ? "Verificando…" : "Continuar →"}
          </button>
        </div>
      </form>
    </>
  );
}

function ServiceOptionCard({
  option,
  selected,
  onToggle,
}: {
  option: FeatureServiceOption;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`service-card${selected ? " is-selected" : ""}${
        option.disabled ? " is-disabled" : ""
      }`}
      aria-disabled={option.disabled || undefined}
    >
      <input
        type="checkbox"
        name="svc"
        value={option.key}
        checked={selected}
        disabled={option.disabled}
        onChange={() => {
          if (!option.disabled) onToggle();
        }}
      />
      <div>
        <strong>
          {option.title}
          {option.disabled && option.disabledHint
            ? ` (${option.disabledHint})`
            : ""}
        </strong>
        <span>{option.description}</span>
      </div>
    </label>
  );
}

function StepServices({
  form,
  toggleService,
  setServiceSelection,
  onBack,
  onNext,
}: {
  form: FormState;
  toggleService: (id: FeatureFlagKey) => void;
  setServiceSelection: (keys: FeatureFlagKey[], selected: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const selectable = selectableServiceKeys();
  const allSelected = selectable.every((k) => form.servicios.includes(k));

  return (
    <>
      <h1>¿Qué módulos necesitás?</h1>
      <p className="secondary">
        Paso 2 de 4 — elegí los servicios para tu negocio. Podés cambiar estas
        selecciones más adelante.
      </p>

      <label
        className="service-card"
        style={{ marginBottom: "1.25rem", maxWidth: "100%" }}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => setServiceSelection(selectable, !allSelected)}
        />
        <div>
          <strong>Seleccionar todos los servicios</strong>
          <span>Marca o desmarca todas las opciones disponibles</span>
        </div>
      </label>

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
                (svc) => (
                  <ServiceOptionCard
                    key={svc.key}
                    option={svc}
                    selected={form.servicios.includes(svc.key)}
                    onToggle={() => toggleService(svc.key)}
                  />
                ),
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

function StepCopi({
  form,
  setCopiTier,
  onBack,
  onNext,
}: {
  form: FormState;
  setCopiTier: (tier: CopiTierId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const selectedTier = copiTierFromSelection(form.servicios);

  return (
    <>
      <h1>Copi, tu asistente</h1>
      <p className="secondary">
        Paso 3 de 4 — elegí cómo querés que Copi te ayude. Después lo podés
        cambiar.
      </p>
      <p className="hint" style={{ marginBottom: "1.25rem", maxWidth: "42rem" }}>
        Copi es el asistente de Nexolia: te responde sobre tu negocio (ventas,
        stock, clientes) y, si lo activás en Pro, también puede hacer cosas por
        vos — como crear tareas o turnos, escucharte por voz y mirar fotos.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="service-grid">
          {COPI_TIER_OPTIONS.map((option) => {
            const selected = selectedTier === option.id;
            return (
              <label
                key={option.id}
                className={`service-card${selected ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="copi-tier"
                  value={option.id}
                  checked={selected}
                  onChange={() => setCopiTier(option.id)}
                />
                <div>
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                  {option.bullets ? (
                    <ul
                      style={{
                        margin: "0.5rem 0 0",
                        paddingLeft: "1.1rem",
                        color: "inherit",
                        fontSize: "0.85rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {option.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>

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

function StepPlan({
  form,
  setPlan,
  setCiclo,
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  form: FormState;
  setPlan: (plan: Plan["id"]) => void;
  setCiclo: (ciclo: BillingCycle) => void;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1>Elegí tu plan</h1>
      <p className="secondary">
        Paso 4 de 4 — Básico y Pro son <strong>gratuitos</strong> por ahora.
        Enterprise se cotiza según tus requisitos.
      </p>

      <div
        className="billing-toggle"
        role="group"
        aria-label="Período de facturación"
      >
        <button
          type="button"
          className={form.ciclo === "monthly" ? "is-active" : ""}
          onClick={() => setCiclo("monthly")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={form.ciclo === "annual" ? "is-active" : ""}
          onClick={() => setCiclo("annual")}
        >
          Anual
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
            const price =
              form.ciclo === "annual" ? plan.annual : plan.monthly;
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
                  onChange={() => setPlan(plan.id)}
                  className="sr-only"
                />
                <div className="name">{plan.name}</div>
                <div className="price">
                  {plan.customPriceLabel ? (
                    <small style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      {plan.customPriceLabel}
                    </small>
                  ) : (
                    <>
                      {formatARS(price ?? 0)}{" "}
                      <small>
                        {form.ciclo === "annual" ? "/ año" : "/ mes"}
                      </small>
                    </>
                  )}
                </div>
                <p
                  className="muted"
                  style={{ fontSize: "0.8rem", margin: "0.5rem 0 0" }}
                >
                  {plan.tagline}
                </p>
                <div className="plan-feature-group">
                  <div className="plan-feature-heading">Servicios</div>
                  <ul className="plan-features">
                    {plan.servicios.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="plan-feature-group">
                  <div className="plan-feature-heading">Copi</div>
                  <ul className="plan-features">
                    {plan.copi.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </label>
            );
          })}
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="onboard-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onBack}
            disabled={submitting}
          >
            ← Volver
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Enviando…" : "Confirmar →"}
          </button>
        </div>
      </form>
    </>
  );
}

function ThanksPanel({
  email,
  orgName,
  planName,
  leadId,
  onReset,
}: {
  email: string;
  orgName: string;
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
        <h1>¡Gracias!</h1>
        <p className="secondary">
          Recibimos el alta de <strong>{orgName}</strong> con el plan{" "}
          <strong>{planName}</strong>. Te enviamos un correo a{" "}
          <strong>{email}</strong> con los detalles.
        </p>
        <p className="secondary">
          Nuestro equipo activará tu cuenta a la brevedad. Por ahora no hay
          cargos: las suscripciones son gratuitas.
        </p>
        <p className="hint" style={{ marginTop: "1rem" }}>
          {INACTIVITY_NOTE}
        </p>
        {leadId && (
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            Referencia: <code>{leadId}</code>
          </p>
        )}
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
