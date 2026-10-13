import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import {
  adminApi,
  type AdminOrganization,
  type AdminPlan,
} from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";
import { formatARS, formatDateAR } from "@/lib/formatters";
import { PlanesEditor } from "@/components/admin/PlanesEditor";
import {
  orgLifecycleBadgeClass,
  orgLifecycleLabel,
  resolveOrgLifecycleState,
} from "@/lib/org-lifecycle-state";

export const metadata: Metadata = { title: "Planes y suscripciones — Admin" };

export const dynamic = "force-dynamic";

function subscriptionAmount(org: AdminOrganization): string {
  const cycle = org.billingCycle === "annual" ? "annual" : "monthly";
  const amount =
    cycle === "annual" ? org.planPriceAnnual : org.planPriceMonthly;
  if (amount == null || amount <= 0) {
    return "A medida";
  }
  return `${formatARS(amount)}${cycle === "annual" ? " / año" : " / mes"}`;
}

function cycleLabel(org: AdminOrganization): string {
  if (org.billingCycle === "annual") return "Anual";
  if (org.billingCycle === "monthly") return "Mensual";
  return "—";
}

function nextChargeLabel(org: AdminOrganization): string {
  const state = resolveOrgLifecycleState(org);
  if (state === "pending_payment") return "Pendiente";
  if (state === "paused" || state === "archived" || state === "deleted") {
    return "—";
  }
  if (!org.licenseExpiresAt) return "—";
  return formatDateAR(org.licenseExpiresAt);
}

export default async function PlanesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let plans: AdminPlan[] = [];
  let subscriptions: AdminOrganization[] = [];
  let loadError = false;

  if (token) {
    try {
      const [planRows, orgRows] = await Promise.all([
        adminApi.plans(token),
        adminApi.organizations(token),
      ]);
      plans = planRows;
      subscriptions = orgRows.filter((org) => {
        const state = resolveOrgLifecycleState(org);
        return state !== "deleted";
      });
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <>
      {loadError ? (
        <div className="card">
          <p>No pudimos cargar los planes. Intentá de nuevo.</p>
        </div>
      ) : null}

      {!loadError && plans.length === 0 ? (
        <div className="card">
          <p>No hay planes para mostrar.</p>
        </div>
      ) : null}

      {!loadError && plans.length > 0 ? <PlanesEditor plans={plans} /> : null}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <h2 style={{ margin: 0, flex: 1 }}>Suscripciones</h2>
          <a
            className="btn btn-secondary btn-sm"
            href={adminHref("/organizaciones", { host })}
          >
            Ver organizaciones
          </a>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Organización</th>
                <th>Plan</th>
                <th>Ciclo</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Próximo cobro</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6}>No hay suscripciones para mostrar.</td>
                </tr>
              ) : (
                subscriptions.map((org) => {
                  const state = resolveOrgLifecycleState(org);
                  return (
                    <tr key={org.id}>
                      <td>
                        <strong>{org.name}</strong>
                      </td>
                      <td>{org.plan || "—"}</td>
                      <td>{cycleLabel(org)}</td>
                      <td>{subscriptionAmount(org)}</td>
                      <td>
                        <span className={orgLifecycleBadgeClass(state)}>
                          {orgLifecycleLabel(state)}
                        </span>
                      </td>
                      <td>{nextChargeLabel(org)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
