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
 *   POST   /admin/organizations/:id/pause
 *   POST   /admin/organizations/:id/resume
 *   POST   /admin/organizations/:id/archive
 *   DELETE /admin/organizations/:id
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
  /** Optional free-text notes (promo code, source metadata). */
  notes?: string;
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

export function fetchPublicPlans() {
  return apiFetch<PublicPlan[]>("/api/public/plans", {
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
  role: "super_admin" | "admin" | string;
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
  status: "new" | "contacted" | "in_progress" | "converted" | "lost" | "closed" | "rejected" | string;
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
  planSlug?: string;
  planPriceMonthly?: number | null;
  planPriceAnnual?: number | null;
  billingCycle?: BillingCycle;
  members: number;
  status:
    | "active"
    | "trial"
    | "pending_payment"
    | "paused"
    | "suspended"
    | "deleted"
    | string;
  createdAt?: string;
  licenseExpiresAt?: string;
  archivedAt?: string | null;
  /** Present for hard-deleted tombstones reconstructed from admin audit. */
  deletedAt?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact: string;
  loginMethod: "email" | "phone" | "unknown" | string;
  org: string;
  orgId: string;
  role: string;
  status: "active" | "pending" | string;
}

export interface AdminLlmCredentialStatus {
  lastError: string | null;
  monthlySpendLimitUsd: number | null;
  openaiProjectId: string | null;
  provisionedAt: string | null;
  status: "pending" | "active" | "failed" | "revoked" | "missing";
}

export interface AdminPlan {
  id: string;
  slug?: string;
  name: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  tagline?: string;
  servicios?: string[];
  copi?: string[];
  features: string[];
  featured?: boolean;
  customPriceLabel?: string | null;
}

export type PublicPlan = AdminPlan;

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

  users: (token: string) =>
    apiFetch<AdminUser[]>("/admin/users", { token, cache: "no-store" }),

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

  rejectLead: (token: string, leadId: string) =>
    apiFetch<{ id: string; status: "rejected" }>(`/admin/leads/${leadId}/reject`, {
      token,
      method: "POST",
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

  confirmOrganizationPayment: (
    token: string,
    orgId: string,
    input?: {
      amount?: number;
      method?: "transfer" | "cash";
      reference?: string;
      notes?: string;
    },
  ) =>
    apiFetch<{
      organizationId: string;
      paymentId: string;
      status: "active";
      licensedUntil: string;
    }>(`/admin/organizations/${orgId}/confirm-payment`, {
      token,
      method: "POST",
      body: input ?? {},
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

  pauseOrganization: (token: string, orgId: string) =>
    apiFetch<{ id: string; name: string; status: string; archivedAt: string | null }>(
      `/admin/organizations/${orgId}/pause`,
      { token, method: "POST" },
    ),

  resumeOrganization: (token: string, orgId: string) =>
    apiFetch<{ id: string; name: string; status: string; archivedAt: string | null }>(
      `/admin/organizations/${orgId}/resume`,
      { token, method: "POST" },
    ),

  archiveOrganization: (
    token: string,
    orgId: string,
    input: { confirmation: string },
  ) =>
    apiFetch<{ archivedAt: string }>(`/admin/organizations/${orgId}/archive`, {
      token,
      method: "POST",
      body: input,
    }),

  deleteOrganization: (
    token: string,
    orgId: string,
    input: { confirmation: string },
  ) =>
    apiFetch<{ deleted: true }>(`/admin/organizations/${orgId}`, {
      token,
      method: "DELETE",
      body: input,
    }),

  getLlmCredentials: (token: string, orgId: string) =>
    apiFetch<AdminLlmCredentialStatus>(
      `/admin/organizations/${orgId}/llm-credentials`,
      { token, cache: "no-store" },
    ),

  provisionLlmCredentials: (token: string, orgId: string) =>
    apiFetch<AdminLlmCredentialStatus>(
      `/admin/organizations/${orgId}/llm-credentials/provision`,
      { token, method: "POST" },
    ),

  revokeLlmCredentials: (token: string, orgId: string) =>
    apiFetch<AdminLlmCredentialStatus>(
      `/admin/organizations/${orgId}/llm-credentials/revoke`,
      { token, method: "POST" },
    ),

  updatePlan: (
    token: string,
    planId: string,
    input: Partial<
      Pick<
        AdminPlan,
        | "name"
        | "priceMonthly"
        | "priceAnnual"
        | "tagline"
        | "servicios"
        | "copi"
        | "featured"
        | "customPriceLabel"
      >
    >,
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
