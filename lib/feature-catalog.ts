/**
 * Selectable org feature flags for public /comenzar.
 * Keys MUST match `OrganizationFeatureFlags` in baas-mvp mobile
 * (`apps/mobile/src/types/features.ts`) so staff conversion can apply them 1:1.
 *
 * Baseline flags (always on) are merged at submit via `buildLeadFeatureFlags`.
 * Copi options are a separate paso (Paso 3).
 */

export type FeatureFlagKey =
  | "commerce_pos"
  | "commerce_inventory"
  | "commerce_lots"
  | "commerce_purchases"
  | "commerce_suppliers"
  | "commerce_nav_shortcut"
  | "billing_invoices"
  | "billing_quotes"
  | "billing_arca"
  | "billing_cash"
  | "appointments"
  | "copi_pro_agent"
  | "copi_voice"
  | "copi_vision"
  | "copi_custom_reports"
  | "notifications"
  | "integrations_whatsapp"
  | "integrations_instagram"
  | "integrations_messenger"
  | "integrations_email"
  | "integrations_sms"
  | "multi_sucursales";

export type CopiTierId = "basic" | "pro";

export interface FeatureServiceOption {
  key: FeatureFlagKey;
  title: string;
  description: string;
  /** Pre-checked on the wizard. */
  defaultSelected?: boolean;
  group: string;
  /** Shown but not selectable (e.g. próximamente). */
  disabled?: boolean;
  disabledHint?: string;
}

/** Paso 2 — servicios (sin Copi ni canales; canales van en baseline). */
export const FEATURE_SERVICE_OPTIONS: FeatureServiceOption[] = [
  {
    key: "commerce_pos",
    title: "Punto de venta",
    description: "Cobros y ventas en mostrador",
    defaultSelected: true,
    group: "Comercio",
  },
  {
    key: "commerce_inventory",
    title: "Inventario",
    description: "Stock de productos y depósitos",
    defaultSelected: true,
    group: "Comercio",
  },
  {
    key: "commerce_lots",
    title: "Lotes y movimientos",
    description: "Trazabilidad de lotes y ajustes",
    defaultSelected: true,
    group: "Comercio",
  },
  {
    key: "commerce_purchases",
    title: "Compras",
    description: "Órdenes de compra a proveedores",
    defaultSelected: true,
    group: "Comercio",
  },
  {
    key: "commerce_suppliers",
    title: "Proveedores",
    description: "Agenda y cuentas de proveedores",
    defaultSelected: true,
    group: "Comercio",
  },
  {
    key: "billing_invoices",
    title: "Facturas",
    description: "Emisión de facturas",
    defaultSelected: true,
    group: "Facturación",
  },
  {
    key: "billing_quotes",
    title: "Presupuestos",
    description: "Cotizaciones y presupuestos",
    defaultSelected: true,
    group: "Facturación",
  },
  {
    key: "billing_arca",
    title: "ARCA (AFIP)",
    description: "Facturación electrónica AFIP",
    defaultSelected: true,
    group: "Facturación",
  },
  {
    key: "billing_cash",
    title: "Caja",
    description: "Gestioná ingresos y egresos",
    group: "Facturación",
  },
  {
    key: "appointments",
    title: "Agenda",
    description: "Agregá y administrá turnos",
    group: "Agenda",
  },
  {
    key: "multi_sucursales",
    title: "Varias sucursales",
    description: "Más de un centro de negocio",
    group: "Operaciones",
    disabled: true,
    disabledHint: "Próximamente",
  },
];

/** Flags enabled together when the user picks Copi Pro. */
export const COPI_PRO_FLAG_KEYS: FeatureFlagKey[] = [
  "copi_pro_agent",
  "copi_voice",
  "copi_vision",
  "copi_custom_reports",
];

/** Bullets shared by Copi Pro option and Pro / Enterprise plans. */
export const COPI_PRO_BULLETS = [
  "Crear tareas, turnos y otras acciones automáticamente",
  "Entradas y respuestas por voz",
  "Reportes personalizados",
  "Análisis de imágenes",
] as const;

export const COPI_BASIC_DESCRIPTION =
  "Consultá a Copi con 5 preguntas ya armadas. No podés escribir preguntas libres.";

export const COPI_PRO_DESCRIPTION =
  "Todo lo de Copi básico, y además Copi puede actuar por vos:";

export interface CopiTierOption {
  id: CopiTierId;
  title: string;
  description: string;
  bullets?: readonly string[];
}

export const COPI_TIER_OPTIONS: CopiTierOption[] = [
  {
    id: "basic",
    title: "Copi básico",
    description: COPI_BASIC_DESCRIPTION,
  },
  {
    id: "pro",
    title: "Copi Pro",
    description: COPI_PRO_DESCRIPTION,
    bullets: COPI_PRO_BULLETS,
  },
];

/** Always-on flags (app baseline + flags everyone gets). */
export const BASELINE_FEATURE_FLAGS: Record<string, true> = {
  account: true,
  browser_session: true,
  help_privacy: true,
  inbox: true,
  integrations: true,
  tasks: true,
  copi_enabled: true,
  copi_basic_reports: true,
  copi_freeform_questions: true,
  // Available to everyone — not shown as optional toggles.
  commerce_nav_shortcut: true,
  notifications: true,
  // Canales on by default (not shown in servicios).
  integrations_whatsapp: true,
  integrations_instagram: true,
  integrations_messenger: true,
  integrations_email: true,
  integrations_sms: true,
};

export function selectableServiceKeys(): FeatureFlagKey[] {
  return FEATURE_SERVICE_OPTIONS.filter((o) => !o.disabled).map((o) => o.key);
}

export function selectableCopiKeys(): FeatureFlagKey[] {
  return [...COPI_PRO_FLAG_KEYS];
}

export function defaultSelectedFeatureKeys(): FeatureFlagKey[] {
  return FEATURE_SERVICE_OPTIONS.filter(
    (o) => o.defaultSelected && !o.disabled,
  ).map((o) => o.key);
}

export function hasCopiProSelection(selected: Iterable<string>): boolean {
  const set = new Set(selected);
  return COPI_PRO_FLAG_KEYS.some((key) => set.has(key));
}

export function copiTierFromSelection(selected: Iterable<string>): CopiTierId {
  return hasCopiProSelection(selected) ? "pro" : "basic";
}

/** Apply Copi básico / Pro as a single choice (mutually exclusive). */
export function applyCopiTierSelection(
  selected: FeatureFlagKey[],
  tier: CopiTierId,
): FeatureFlagKey[] {
  const withoutCopi = selected.filter(
    (key) => !COPI_PRO_FLAG_KEYS.includes(key),
  );
  if (tier === "basic") {
    return withoutCopi;
  }
  return [...withoutCopi, ...COPI_PRO_FLAG_KEYS];
}

/** Build org feature_flags payload from selected servicios + Copi keys. */
export function buildLeadFeatureFlags(
  selected: Iterable<string>,
): Record<string, boolean> {
  const selectedSet = new Set(selected);
  const flags: Record<string, boolean> = { ...BASELINE_FEATURE_FLAGS };
  const pro = hasCopiProSelection(selectedSet);

  for (const option of FEATURE_SERVICE_OPTIONS) {
    if (option.disabled) {
      flags[option.key] = false;
      continue;
    }
    flags[option.key] = selectedSet.has(option.key);
  }

  for (const key of COPI_PRO_FLAG_KEYS) {
    flags[key] = pro;
  }

  return flags;
}

export function featureOptionTitle(key: string): string {
  return (
    FEATURE_SERVICE_OPTIONS.find((o) => o.key === key)?.title ??
    (COPI_PRO_FLAG_KEYS.includes(key as FeatureFlagKey) ? "Copi Pro" : key)
  );
}

/** WhatsApp support (same line as the mobile HelpSupportScreen). */
export const SUPPORT_WHATSAPP_URL = "https://wa.me/543546517096";
