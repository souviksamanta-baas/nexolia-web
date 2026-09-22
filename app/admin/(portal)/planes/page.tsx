import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminPlan } from "@/lib/api";
import { formatARS } from "@/lib/formatters";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = { title: "Planes y suscripciones — Admin" };

export default async function PlanesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let plans: AdminPlan[] = [];
  let loadError = false;
  if (token) {
    try {
      plans = await adminApi.plans(token);
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Planes y suscripciones</h1>
          <p>Catálogo comercial y suscripciones activas</p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button">
          Editar precios
        </button>
      </div>

      {loadError ? (
        <div className="card">
          <p>No pudimos cargar los planes. Intentá de nuevo.</p>
        </div>
      ) : null}

      {plans.length === 0 && !loadError ? (
        <div className="card">
          <p>No hay planes para mostrar.</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card${plan.featured ? " featured" : ""}`}
            >
              {plan.featured && (
                <span
                  className="badge badge-green"
                  style={{ position: "absolute", top: "1rem", right: "1rem" }}
                >
                  Popular
                </span>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                {formatARS(plan.priceMonthly)} <span>/ mes</span>
              </div>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <h2 style={{ margin: 0, flex: 1 }}>Suscripciones</h2>
          <a className="btn btn-secondary btn-sm" href={adminHref("/organizaciones", { host })}>
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
              <tr>
                <td colSpan={6}>No hay suscripciones para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
