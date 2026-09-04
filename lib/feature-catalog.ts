/**
 * Selectable org feature flags for public /comenzar (Paso 2).
 * Keys MUST match `OrganizationFeatureFlags` in baas-mvp mobile
 * (`apps/mobile/src/types/features.ts`) so staff conversion can apply them 1:1.
 *
 * Baseline flags (always on in the app) are NOT listed here — they are merged
 * at submit time via `buildLeadFeatureFlags`.
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
  /** Pre-checked on the wizard (commerce defaults match app kiosco-like). */
  defaultSelected?: boolean;
  group: string;
}

/** Same grouping / labels as mobile OnboardingScreen FEATURE_GROUPS (+ channels + multi). */
export const FEATURE_SERVICE_OPTIONS: FeatureServiceOption[] = [
  // Comercio
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
    key: "commerce_nav_shortcut",
    title: "Atajo Ventas en menú",
    description: "Muestra Ventas en el menú inferior de la app",
    defaultSelected: true,
    group: "Comercio",
  },
  // Facturación
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
    description: "Arqueos y medios de pago",
    group: "Facturación",
  },
  // Agenda
  {
    key: "appointments",
    title: "Turnos y agenda",
    description: "Reservas para clínicas y servicios",
    group: "Agenda",
  },
  // Copi
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
  // Notificaciones
  {
    key: "notifications",
    title: "Notificaciones push",
    description: "Avisos push para el equipo",
    defaultSelected: true,
    group: "Notificaciones",
  },
  // Canales (integrations_*)
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
  // Ops
  {
    key: "multi_sucursales",
    title: "Varias sucursales",
    description: "Más de un centro de negocio",
    group: "Operaciones",
  },
];

/** Always-on flags from the app (`BASELINE_FEATURE_FLAGS`). */
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
};

export function defaultSelectedFeatureKeys(): FeatureFlagKey[] {
  return FEATURE_SERVICE_OPTIONS.filter((o) => o.defaultSelected).map((o) => o.key);
}

/** Build org feature_flags payload from selected Paso 2 keys. */
export function buildLeadFeatureFlags(
  selected: Iterable<string>,
): Record<string, boolean> {
  const selectedSet = new Set(selected);
  const flags: Record<string, boolean> = { ...BASELINE_FEATURE_FLAGS };

  for (const option of FEATURE_SERVICE_OPTIONS) {
    flags[option.key] = selectedSet.has(option.key);
  }

  return flags;
}

export function featureOptionTitle(key: string): string {
  return FEATURE_SERVICE_OPTIONS.find((o) => o.key === key)?.title ?? key;
}
