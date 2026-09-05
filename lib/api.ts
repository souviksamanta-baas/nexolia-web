/**
 * Nest (baas-mvp) API client.
 *
 * Public endpoints (no auth):
 *   POST /public/leads
 *
 * Admin endpoints (Supabase JWT in Authorization: Bearer <token>):
 *   GET    /admin/me
 *   GET    /admin/dashboard
 *   GET    /admin/leads
 *   GET    /admin/organizations
 *   GET    /admin/plans
 *   GET    /admin/payments/pending
 *   POST   /admin/leads/:id/convert
 *   POST   /admin/payments
 *   POST   /admin/payments/:id/confirm
 *   POST   /admin/organizations
 *   POST   /admin/grok/chat
 *   PATCH  /admin/organizations/:id/license
 *   PATCH  /admin/plans/:id
 */

/** Browser / server Nest base URL (prefer same-origin `/api/*` proxies for public POSTs). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BAAS_API_URL ||
  process.env.BAAS_API_URL ||
  "https://baas-project-production.up.railway.app";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export interface ApiOptions extends Omit<RequestInit, "body" | "headers"> {
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, body, headers, ...rest } = options;
  const url = path.startsWith("http")
    ? path
    : path.startsWith("/api/")
      ? path // same-origin Next.js route handlers
      : `${API_BASE_URL}${path}`;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers || {}),
  };
  if (body !== undefined) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
  }
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text();
  let parsed: unknown = raw;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      /* not JSON */
    }
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : `Request failed: ${res.status}`) || `Request failed: ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

export type BillingCycle = "monthly" | "annual";

export interface PublicLeadInput {
  email: string;
  orgName: string;
  categoria: string;
  /** Selected feature-flag keys (same as OrganizationFeatureFlags). */
  servicios: string[];
  /** Full org feature_flags map (baseline + selected). Prefer this on the API. */
  featureFlags?: Record<string, boolean>;
  plan: string;
  ciclo: BillingCycle;
  source?: string;
}

export interface PublicLeadResponse {
  id: string;
  email: string;
  status: string;
  createdAt?: string;
}

export interface OrgNameCheckResult {
  available: boolean;
  ownedByRequester: boolean;
  orgName: string;
}

export function submitPublicLead(input: PublicLeadInput) {
  // Same-origin Next proxy → Nest (runtime BAAS_API_URL; no CORS / no localhost bake-in).
  return apiFetch<PublicLeadResponse>("/api/public/leads", {
    method: "POST",
    body: input,
    cache: "no-store",
  });
}

export function checkOrgName(input: { email: string; name: string }) {
  return apiFetch<OrgNameCheckResult>("/api/public/org-name-check", {
    method: "POST",
    body: input,
    cache: "no-store",
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export interface AdminMe {
  id: string;
  email: string;
  name?: string;
  role: "super_admin" | "operations" | "support" | "finance" | string;
}

export interface DashboardKpi {
  label: string;
  value: number | string;
  delta?: string;
  tone?: "positive" | "warning" | "danger" | "muted";
}

export interface DashboardResponse {
  kpis: DashboardKpi[];
  paymentsByDay: { day: string; total: number }[];
  activity: {
    id: string;
    kind: "lead" | "payment" | "org" | "license" | string;
    title: string;
    detail: string;
    at: string;
    tone?: "positive" | "warning" | "danger";
  }[];
  recentClients: {
    id: string;
    name: string;
    plan: string;
    status: string;
    lastPayment?: string;
  }[];
}

export interface AdminLead {
  id: string;
  email: string;
  business: string;
  categoria: string;
  servicios: string[];
  plan: string;
  ciclo: BillingCycle;
  status: "new" | "contacted" | "converted" | "lost" | string;
  createdAt: string;
  organizationId?: string | null;
  orgName?: string | null;
}

export interface AdminOrganization {
  id: string;
  name: string;
  ownerName?: string;
  ownerEmail?: string;
  plan: string;
  members: number;
  status: "active" | "trial" | "suspended" | string;
  licenseExpiresAt?: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  featured?: boolean;
}

export interface AdminPayment {
  id: string;
  orgId: string;
  orgName: string;
  amount: number;
  method: "transfer" | "cash";
  status: "pending" | "confirmed" | string;
  reference?: string;
  createdAt: string;
}

export interface GrokChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GrokChatResponse {
  message: GrokChatMessage;
  audit?: { id: string };
}

export const adminApi = {
  me: (token: string) => apiFetch<AdminMe>("/admin/me", { token, cache: "no-store" }),

  dashboard: (token: string) =>
    apiFetch<DashboardResponse>("/admin/dashboard", { token, cache: "no-store" }),

  leads: (token: string) =>
    apiFetch<AdminLead[]>("/admin/leads", { token, cache: "no-store" }),

  organizations: (token: string) =>
    apiFetch<AdminOrganization[]>("/admin/organizations", { token, cache: "no-store" }),

  plans: (token: string) =>
    apiFetch<AdminPlan[]>("/admin/plans", { token, cache: "no-store" }),

  pendingPayments: (token: string) =>
    apiFetch<AdminPayment[]>("/admin/payments/pending", { token, cache: "no-store" }),

  convertLead: (
    token: string,
    leadId: string,
    input: { orgName: string; ownerEmail: string; ownerName?: string; plan?: string },
  ) =>
    apiFetch<{ organizationId: string }>(`/admin/leads/${leadId}/convert`, {
      token,
      method: "POST",
      body: input,
    }),

  provisionPendingLeads: (token: string) =>
    apiFetch<{ converted: number; failed: number }>(
      "/admin/leads/provision-pending",
      { token, method: "POST" },
    ),

  createPayment: (
    token: string,
    input: {
      orgId: string;
      amount: number;
      method: "transfer" | "cash";
      reference?: string;
    },
  ) =>
    apiFetch<AdminPayment>("/admin/payments", { token, method: "POST", body: input }),

  confirmPayment: (token: string, paymentId: string) =>
    apiFetch<AdminPayment>(`/admin/payments/${paymentId}/confirm`, {
      token,
      method: "POST",
    }),

  createOrganization: (
    token: string,
    input: { name: string; plan?: string; ownerEmail?: string; ownerName?: string },
  ) =>
    apiFetch<AdminOrganization>("/admin/organizations", {
      token,
      method: "POST",
      body: input,
    }),

  updateLicense: (
    token: string,
    orgId: string,
    input: { plan?: string; expiresAt?: string | null; status?: string },
  ) =>
    apiFetch<AdminOrganization>(`/admin/organizations/${orgId}/license`, {
      token,
      method: "PATCH",
      body: input,
    }),

  updatePlan: (
    token: string,
    planId: string,
    input: Partial<Pick<AdminPlan, "name" | "priceMonthly" | "priceAnnual" | "features" | "featured">>,
  ) =>
    apiFetch<AdminPlan>(`/admin/plans/${planId}`, {
      token,
      method: "PATCH",
      body: input,
    }),

  grokChat: (token: string, input: { messages: GrokChatMessage[]; chip?: string }) =>
    apiFetch<GrokChatResponse>("/admin/grok/chat", {
      token,
      method: "POST",
      body: input,
    }),
};
