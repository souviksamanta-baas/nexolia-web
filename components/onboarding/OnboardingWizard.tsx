"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  checkOrgName,
  fetchPublicPlans,
  submitPublicLead,
  type BillingCycle,
  type PublicPlan,
  ApiError,
} from "@/lib/api";
import { formatARS, formatDateAR } from "@/lib/formatters";
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
  planIncludesMultiSucursales,
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

const TRIAL_DAYS = 15;
/** Annual = 11 months (1 month free). */
function annualFromMonthly(monthly: number): number {
  return monthly * 11;
}

/** Launch discount: 50% off the first 6 months (promo codes come later). */
const LAUNCH_DISCOUNT_PERCENT = 50;
const LAUNCH_DISCOUNT_MONTHS = 6;

/** Fallback if /public/plans is unavailable; admin /planes is the source of truth. */
const DEFAULT_PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    monthly: 65_000,
    annual: annualFromMonthly(65_000),
    tagline: "Hasta 5 usuarios · 1 sucursal",
    featured: true,
    servicios: [...PLAN_SERVICIOS],
    copi: [...COPI_BASIC_PLAN_FEATURES],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 85_000,
    annual: annualFromMonthly(85_000),
    tagline: "Hasta 5 usuarios · 1 sucursal",
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

function mapPublicPlan(plan: PublicPlan): Plan | null {
  const slug = (plan.slug ?? "").trim().toLowerCase();
  if (slug !== "basico" && slug !== "pro" && slug !== "enterprise") {
    return null;
  }
  const customPriceLabel = plan.customPriceLabel?.trim() || undefined;
  return {
    id: slug,
    name: plan.name,
    monthly: customPriceLabel ? null : (plan.priceMonthly ?? null),
    annual: customPriceLabel ? null : (plan.priceAnnual ?? null),
    tagline: plan.tagline ?? "",
    featured: Boolean(plan.featured),
    customPriceLabel,
    servicios:
      plan.servicios && plan.servicios.length > 0
        ? plan.servicios
        : [...PLAN_SERVICIOS],
    copi:
      plan.copi && plan.copi.length > 0
        ? plan.copi
        : slug === "basico"
          ? [...COPI_BASIC_PLAN_FEATURES]
          : [...COPI_PRO_BULLETS],
  };
}

const INACTIVITY_NOTE =
  "Si tu organización permanece inactiva durante 30 días, puede eliminarse automáticamente.";

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

/** Amount charged on the first invoice after trial (ARS), with launch discount. */
function firstChargeAmount(params: {
  ciclo: BillingCycle;
  monthly: number | null;
}): number | null {
  if (params.monthly == null) return null;
  if (params.ciclo === "monthly") {
    return Math.round(params.monthly * (1 - LAUNCH_DISCOUNT_PERCENT / 100));
  }
  // Annual: 11 months; 50% off the first 6 months equivalent.
  const discountedMonths =
    LAUNCH_DISCOUNT_MONTHS * (1 - LAUNCH_DISCOUNT_PERCENT / 100);
  const fullMonths = 11 - LAUNCH_DISCOUNT_MONTHS;
  return Math.round(params.monthly * (discountedMonths + fullMonths));
}

/**
 * Keep Copi tier / Multisucursal and plan in sync:
 * - Copi Pro → at least plan Pro (keep Enterprise if already chosen)
 * - Plan Pro / Enterprise → Copi Pro (plan entitlement)
 * - Varias sucursales ↔ Enterprise
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

  const wantsMulti = next.servicios.includes("multi_sucursales");
  if (wantsMulti && !planIncludesMultiSucursales(next.plan)) {
    next = { ...next, plan: "enterprise" };
  }

  // Enterprise does not auto-enable Multisucursal — only the explicit toggle does.

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
  discountCode: string;
}

const initialState: FormState = {
  email: "",
  orgName: "",
  categoria: "",
  servicios: defaultSelectedFeatureKeys(),
  plan: "basico",
  ciclo: "monthly",
  discountCode: "",
};

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchPublicPlans();
        const mapped = rows
          .map(mapPublicPlan)
          .filter((p): p is Plan => p != null);
        if (!cancelled && mapped.length > 0) {
          setPlans(mapped);
        }
      } catch {
        /* keep DEFAULT_PLANS */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === form.plan) ?? plans[0] ?? DEFAULT_PLANS[0],
    [form.plan, plans],
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
    setForm((f) => {
      let next: FormState = { ...f, plan };
      if (!planIncludesMultiSucursales(plan)) {
        next = {
          ...next,
          servicios: next.servicios.filter((key) => key !== "multi_sucursales"),
        };
      }
      return syncPlanAndCopi(next);
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const featureFlags = buildLeadFeatureFlags(form.servicios, form.plan);
      const notesParts = [
        "source=nexolia-web/comenzar",
        `trial_days=${TRIAL_DAYS}`,
        `discount=${LAUNCH_DISCOUNT_PERCENT}%_first_${LAUNCH_DISCOUNT_MONTHS}_months`,
      ];
      if (form.discountCode.trim()) {
        notesParts.push(`discount_code=${form.discountCode.trim()}`);
      }
      const res = await submitPublicLead({
        email: form.email,
        orgName: form.orgName,
        categoria: form.categoria,
        servicios: form.servicios,
        featureFlags,
        plan: form.plan,
        ciclo: form.ciclo,
        notes: notesParts.join("; "),
        source: "nexolia-web/comenzar",
      });
      setLeadId(res.id ?? "pendiente");
      setSubmitted(true);
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
                plans={plans}
                setPlan={setPlan}
                setCiclo={(ciclo) => setForm((f) => ({ ...f, ciclo }))}
                onBack={() => setStep(3)}
                onNext={() => {
                  setError(null);
                  setStep(5);
                }}
              />
            )}
            {step === 5 && (
              <StepBillingConfirm
                form={form}
                plan={selectedPlan}
                setDiscountCode={(discountCode) =>
                  setForm((f) => ({ ...f, discountCode }))
                }
                submitting={submitting}
                submitted={submitted}
                leadId={leadId}
                error={error}
                onBack={() => setStep(4)}
                onSubmit={submit}
                onReset={() => {
                  setForm(initialState);
                  setStep(1);
                  setLeadId(null);
                  setError(null);
                  setSubmitted(false);
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
    { label: "Facturación", index: 5 },
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
        : `Plan ${selectedPlan.name} · ${formatARS(
            form.ciclo === "annual"
              ? (selectedPlan.annual ?? 0)
              : (selectedPlan.monthly ?? 0),
          )}${form.ciclo === "annual" ? "/año" : "/mes"}`
      : step >= 4
        ? `Plan ${selectedPlan.name}`
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
        Paso 1 de 5 — empezamos con lo básico para armar tu cuenta.
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
        Paso 2 de 5 — elegí los servicios para tu negocio. Podés cambiar estas
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
        Paso 3 de 5 — elegí cómo querés que Copi te ayude. Después lo podés
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
  plans,
  setPlan,
  setCiclo,
  onBack,
  onNext,
}: {
  form: FormState;
  plans: Plan[];
  setPlan: (plan: Plan["id"]) => void;
  setCiclo: (ciclo: BillingCycle) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <h1>Elegí tu plan</h1>
      <p className="secondary">
        Paso 4 de 5 — incluye <strong>{TRIAL_DAYS} días de prueba</strong> al
        crear tu organización. Enterprise se cotiza según tus requisitos.
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
          <span className="billing-toggle-badge">1 mes gratis</span>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="onboard-plans">
          {plans.map((plan) => {
            const selected = form.plan === plan.id;
            const price =
              form.ciclo === "annual" ? plan.annual : plan.monthly;
            return (
              <label
                key={plan.id}
                className={`onboard-plan${selected ? " is-selected" : ""}${
                  plan.featured ? " is-featured" : ""
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selected}
                  onChange={() => setPlan(plan.id)}
                  className="sr-only"
                />
                {plan.featured ? (
                  <span className="onboard-plan-popular">Popular</span>
                ) : null}
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
                {form.ciclo === "annual" && plan.monthly != null ? (
                  <p className="plan-annual-note">
                    Equivale a 11 meses · <strong>1 mes gratis</strong>
                  </p>
                ) : null}
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

function StepBillingConfirm({
  form,
  plan,
  setDiscountCode,
  submitting,
  submitted,
  leadId,
  error,
  onBack,
  onSubmit,
  onReset,
}: {
  form: FormState;
  plan: Plan;
  setDiscountCode: (code: string) => void;
  submitting: boolean;
  submitted: boolean;
  leadId: string | null;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const [showDiscountField, setShowDiscountField] = useState(
    () => form.discountCode.trim().length > 0,
  );
  const billingStarts = addDays(new Date(), TRIAL_DAYS);
  const listMonthly = plan.monthly;
  const listAnnual = plan.annual;
  const firstCharge = firstChargeAmount({
    ciclo: form.ciclo,
    monthly: listMonthly,
  });
  const isCustom = Boolean(plan.customPriceLabel);
  const listPrice =
    form.ciclo === "annual" ? (listAnnual ?? null) : (listMonthly ?? null);
  const launchDiscountAmount =
    listPrice != null && firstCharge != null
      ? Math.max(0, listPrice - firstCharge)
      : null;

  return (
    <>
      {submitted ? (
        <div className="thanks-box">
          <div className="check" aria-hidden="true">
            ✓
          </div>
          <h1>¡Listo! Pedido confirmado</h1>
          <p className="secondary">
            Recibimos el alta de <strong>{form.orgName}</strong> con el plan{" "}
            <strong>{plan.name}</strong> (
            {form.ciclo === "annual" ? "anual" : "mensual"}). Te enviamos un
            correo a <strong>{form.email}</strong> con los detalles.
          </p>
          <p className="secondary">
            Tu organización tendrá <strong>{TRIAL_DAYS} días de prueba</strong>{" "}
            desde que la activemos. La facturación comienza el{" "}
            <strong>{formatDateAR(billingStarts)}</strong>
            {isCustom
              ? "; el precio Enterprise se cotiza a medida."
              : firstCharge != null
                ? ` con un primer cobro de ${formatARS(firstCharge)} (incluye ${LAUNCH_DISCOUNT_PERCENT}% off los primeros ${LAUNCH_DISCOUNT_MONTHS} meses).`
                : "."}{" "}
            Todavía no hay pago online: te vamos a contactar para coordinarlo.
          </p>
          {leadId ? (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              Referencia: <code>{leadId}</code>
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <h1>Facturación y confirmación</h1>
          <p className="secondary">
            Paso 5 de 5 — revisá el resumen. Todavía no hay pago online: te
            contactamos para coordinar la facturación después de la prueba.
          </p>
        </>
      )}

      <div className="billing-summary">
        <div className="billing-summary-row">
          <span>Plan</span>
          <strong>{plan.name}</strong>
        </div>
        <div className="billing-summary-row">
          <span>Ciclo</span>
          <strong>{form.ciclo === "annual" ? "Anual" : "Mensual"}</strong>
        </div>
        <div className="billing-summary-row">
          <span>Prueba</span>
          <strong>{TRIAL_DAYS} días desde la creación de la org</strong>
        </div>
        <div className="billing-summary-row">
          <span>Inicio de facturación</span>
          <strong>{formatDateAR(billingStarts)}</strong>
        </div>
        {isCustom ? (
          <div className="billing-summary-row">
            <span>Precio</span>
            <strong>A medida — te cotizamos</strong>
          </div>
        ) : (
          <>
            <div className="billing-summary-row">
              <span>Precio de lista</span>
              <strong>
                {form.ciclo === "annual"
                  ? `${formatARS(listAnnual ?? 0)} / año`
                  : `${formatARS(listMonthly ?? 0)} / mes`}
              </strong>
            </div>
            {form.ciclo === "annual" ? (
              <div className="billing-summary-row">
                <span>Anual</span>
                <strong>11 meses (1 mes gratis)</strong>
              </div>
            ) : null}

            <div className="billing-discounts">
              <div className="billing-discounts-label">Descuentos</div>
              <div className="billing-summary-row is-discount">
                <span>
                  Descuento {LAUNCH_DISCOUNT_PERCENT}% · primeros{" "}
                  {LAUNCH_DISCOUNT_MONTHS} meses
                </span>
                <strong>
                  {launchDiscountAmount != null
                    ? `−${formatARS(launchDiscountAmount)}`
                    : `−${LAUNCH_DISCOUNT_PERCENT}%`}
                </strong>
              </div>
              {submitted && form.discountCode.trim() ? (
                <div className="billing-summary-row is-discount">
                  <span>Código {form.discountCode.trim()}</span>
                  <strong>—</strong>
                </div>
              ) : null}
              {!submitted ? (
                <div className="billing-promo-slot">
                  {showDiscountField ? (
                    <div className="field billing-promo-field">
                      <label htmlFor="discountCode">Código de descuento</label>
                      <input
                        id="discountCode"
                        type="text"
                        value={form.discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Ingresá tu código"
                        autoComplete="off"
                        disabled={submitting}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="discount-code-link"
                      onClick={() => setShowDiscountField(true)}
                      disabled={submitting}
                    >
                      + Agregar código de descuento
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="billing-summary-row is-total">
              <span>Primer cobro (después de la prueba)</span>
              <strong>{formatARS(firstCharge ?? 0)}</strong>
            </div>
            {form.ciclo === "monthly" && listMonthly != null ? (
              <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
                Luego de {LAUNCH_DISCOUNT_MONTHS} meses:{" "}
                {formatARS(listMonthly)} / mes.
              </p>
            ) : null}
            {form.ciclo === "annual" ? (
              <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
                El {LAUNCH_DISCOUNT_PERCENT}% se aplica sobre el equivalente a
                los primeros {LAUNCH_DISCOUNT_MONTHS} meses del anual.
              </p>
            ) : null}
          </>
        )}
      </div>

      {submitted ? (
        <>
          <p className="hint" style={{ marginTop: "1rem" }}>
            {INACTIVITY_NOTE}
          </p>
          <div className="onboard-actions" style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-secondary" type="button" onClick={onReset}>
              Nuevo pedido
            </button>
            <Link className="btn btn-primary" href="/">
              Volver al inicio
            </Link>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <p className="hint" style={{ marginTop: "1rem" }}>
            {INACTIVITY_NOTE}
          </p>

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
              {submitting ? "Enviando…" : "Confirmar alta →"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
