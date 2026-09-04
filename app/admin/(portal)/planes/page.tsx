import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminPlan } from "@/lib/api";
import { formatARS } from "@/lib/formatters";

export const metadata: Metadata = { title: "Planes y suscripciones — Admin" };

const FALLBACK_PLANS: AdminPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29_000,
    priceAnnual: 295_800,
    features: ["1 usuario owner", "Módulos esenciales", "Soporte por email"],
  },
  {
    id: "basico",
    name: "Básico",
    priceMonthly: 69_000,
    priceAnnual: 703_800,
    features: ["Hasta 5 usuarios", "Stock + ventas + tareas", "Soporte prioritario"],
    featured: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 149_000,
    priceAnnual: 1_519_800,
    features: ["Usuarios ilimitados", "Todos los módulos", "Onboarding asistido"],
  },
];

interface SubscriptionRow {
  id: string;
  org: string;
  plan: string;
  cycle: "Mensual" | "Anual";
  amount: string;
  status: "Activa" | "Por confirmar" | "Por vencer" | "Prueba";
  nextCharge: string;
}

const SUBSCRIPTIONS: SubscriptionRow[] = [
  { id: "s1", org: "Ferretería Villalba", plan: "Básico", cycle: "Mensual", amount: formatARS(69000), status: "Activa", nextCharge: "28/09/2026" },
  { id: "s2", org: "Clínica Norte", plan: "Pro", cycle: "Anual", amount: formatARS(1_490_000), status: "Activa", nextCharge: "01/09/2027" },
  { id: "s3", org: "Dietética Sol", plan: "Starter", cycle: "Mensual", amount: formatARS(29000), status: "Por confirmar", nextCharge: "—" },
  { id: "s4", org: "Taller El Rápido", plan: "Pro", cycle: "Mensual", amount: formatARS(149000), status: "Por vencer", nextCharge: "15/09/2026" },
  { id: "s5", org: "Veterinaria Paz", plan: "Básico", cycle: "Mensual", amount: formatARS(69000), status: "Prueba", nextCharge: "Fin prueba 10/09" },
];

export default async function PlanesPage() {
  const token = await getServerAccessToken();
  let plans: AdminPlan[] = FALLBACK_PLANS;
  if (token) {
    try {
      const res = await adminApi.plans(token);
      if (res.length) plans = res;
    } catch {
      plans = FALLBACK_PLANS;
    }
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

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <h2 style={{ margin: 0, flex: 1 }}>Suscripciones</h2>
          <input type="search" placeholder="Filtrar…" style={{ maxWidth: 200 }} />
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
              {SUBSCRIPTIONS.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a href="/admin/organizaciones">{s.org}</a>
                  </td>
                  <td>{s.plan}</td>
                  <td>{s.cycle}</td>
                  <td>{s.amount}</td>
                  <td>
                    <SubStatus status={s.status} />
                  </td>
                  <td>{s.nextCharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SubStatus({ status }: { status: SubscriptionRow["status"] }) {
  switch (status) {
    case "Activa":
      return <span className="badge badge-green">{status}</span>;
    case "Por confirmar":
    case "Por vencer":
      return <span className="badge badge-warn">{status}</span>;
    case "Prueba":
      return <span className="badge badge-muted">{status}</span>;
    default:
      return <span className="badge badge-navy">{status}</span>;
  }
}
