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

/** Paso 2 — servicios (sin Copi; notificaciones y atajo Ventas van en baseline). */
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
    key: "integrations_whatsapp",
    title: "WhatsApp",
    description: "Bandeja y envíos por WhatsApp",
    defaultSelected: true,
    group: "Canales",
  },
  {
    key: "integrations_instagram",
    title: "Instagram",
    description: "Mensajes de Instagram",
    defaultSelected: true,
    group: "Canales",
  },
  {
    key: "integrations_messenger",
    title: "Messenger",
    description: "Mensajes de Facebook Messenger",
    defaultSelected: true,
    group: "Canales",
  },
  {
    key: "integrations_email",
    title: "Email",
    description: "Canal de correo",
    defaultSelected: true,
    group: "Canales",
  },
  {
    key: "integrations_sms",
    title: "SMS",
    description: "Envío de SMS",
    defaultSelected: true,
    group: "Canales",
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

/** Paso 3 — Copi (separado de servicios). */
export const COPI_SERVICE_OPTIONS: FeatureServiceOption[] = [
  {
    key: "copi_pro_agent",
    title: "Copi Pro",
    description: "Acciones automáticas del asistente",
    group: "Copi",
  },
  {
    key: "copi_voice",
    title: "Copi con voz",
    description: "Entrada y respuestas por voz",
    group: "Copi",
  },
  {
    key: "copi_vision",
    title: "Copi con visión",
    description: "Análisis de imágenes",
    group: "Copi",
  },
  {
    key: "copi_custom_reports",
    title: "Reportes personalizados Copi",
    description: "Informes a medida con Copi",
    group: "Copi",
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
};

export function selectableServiceKeys(): FeatureFlagKey[] {
  return FEATURE_SERVICE_OPTIONS.filter((o) => !o.disabled).map((o) => o.key);
}

export function selectableCopiKeys(): FeatureFlagKey[] {
  return COPI_SERVICE_OPTIONS.filter((o) => !o.disabled).map((o) => o.key);
}

export function defaultSelectedFeatureKeys(): FeatureFlagKey[] {
  return FEATURE_SERVICE_OPTIONS.filter(
    (o) => o.defaultSelected && !o.disabled,
  ).map((o) => o.key);
}

/** Build org feature_flags payload from selected servicios + Copi keys. */
export function buildLeadFeatureFlags(
  selected: Iterable<string>,
): Record<string, boolean> {
  const selectedSet = new Set(selected);
  const flags: Record<string, boolean> = { ...BASELINE_FEATURE_FLAGS };

  for (const option of [...FEATURE_SERVICE_OPTIONS, ...COPI_SERVICE_OPTIONS]) {
    if (option.disabled) {
      flags[option.key] = false;
      continue;
    }
    flags[option.key] = selectedSet.has(option.key);
  }

  return flags;
}

export function featureOptionTitle(key: string): string {
  return (
    FEATURE_SERVICE_OPTIONS.find((o) => o.key === key)?.title ??
    COPI_SERVICE_OPTIONS.find((o) => o.key === key)?.title ??
    key
  );
}

/** WhatsApp support (same line as the mobile HelpSupportScreen). */
export const SUPPORT_WHATSAPP_URL = "https://wa.me/543546517096";
