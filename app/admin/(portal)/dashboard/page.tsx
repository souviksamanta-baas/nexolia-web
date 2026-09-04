import type { Metadata } from "next";
import Link from "next/link";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type DashboardResponse } from "@/lib/api";
import { formatARS } from "@/lib/formatters";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
};

const FALLBACK: DashboardResponse = {
  kpis: [
    { label: "Clientes activos", value: 128, delta: "+6 este mes", tone: "positive" },
    { label: "En prueba", value: 14, delta: "3 por vencer", tone: "positive" },
    { label: "Pagos por confirmar", value: 7, delta: "2 hace más de 48 h", tone: "warning" },
    { label: "Licencias por vencer", value: 5, delta: "próximos 15 días", tone: "warning" },
  ],
  paymentsByDay: [
    { day: "L", total: 35 },
    { day: "M", total: 52 },
    { day: "X", total: 40 },
    { day: "J", total: 68 },
    { day: "V", total: 55 },
    { day: "S", total: 78 },
    { day: "D", total: 62 },
    { day: "L", total: 88 },
  ],
  activity: [
    {
      id: "a1",
      kind: "lead",
      title: "Lead nuevo",
      detail: "Ferretería Villalba (Básico)",
      at: "hace 12 min",
      tone: "positive",
    },
    {
      id: "a2",
      kind: "payment",
      title: "Pago por confirmar",
      detail: "Dietética Sol · transferencia $69.000",
      at: "hace 45 min",
      tone: "warning",
    },
    {
      id: "a3",
      kind: "org",
      title: "Lead convertido",
      detail: "Clínica Norte → org creada",
      at: "hace 2 h",
      tone: "positive",
    },
    {
      id: "a4",
      kind: "license",
      title: "Licencia por vencer",
      detail: "Taller El Rápido · Pro",
      at: "hace 3 h",
      tone: "danger",
    },
    {
      id: "a5",
      kind: "payment",
      title: "Pago en efectivo",
      detail: "Veterinaria Paz · pendiente de caja",
      at: "ayer",
      tone: "warning",
    },
  ],
  recentClients: [
    { id: "c1", name: "Ferretería Villalba", plan: "Básico", status: "Activo", lastPayment: `${formatARS(69000)} · 28/08` },
    { id: "c2", name: "Dietética Sol", plan: "Starter", status: "Pago pendiente", lastPayment: "—" },
    { id: "c3", name: "Clínica Norte", plan: "Pro", status: "Activo", lastPayment: `${formatARS(149000)} · 01/09` },
    { id: "c4", name: "Taller El Rápido", plan: "Pro", status: "Por vencer", lastPayment: `${formatARS(149000)} · 15/08` },
  ],
};

export default async function DashboardPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let data: DashboardResponse = FALLBACK;
  if (token) {
    try {
      data = await adminApi.dashboard(token);
    } catch {
      data = FALLBACK;
    }
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen operativo — leads, pagos y licencias</p>
        </div>
        <Link className="btn btn-secondary btn-sm" href={adminHref("/dashboard/grok", { host })}>
          Abrir Grok
        </Link>
      </div>

      <div className="kpi-grid">
        {data.kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="label">{kpi.label}</div>
            <div className="value">{kpi.value}</div>
            {kpi.delta && (
              <div
                className={`delta${
                  kpi.tone === "warning" || kpi.tone === "danger" ? " warn" : ""
                }`}
              >
                {kpi.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div
            className="chart-placeholder"
            aria-label="Gráfico de pagos confirmados"
          >
            <div className="chart-label">Pagos confirmados (últimos 30 días)</div>
            {data.paymentsByDay.map((point, idx) => (
              <div
                key={`${point.day}-${idx}`}
                className="bar"
                style={{ height: `${Math.min(100, Math.max(10, point.total))}%` }}
              />
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Actividad reciente</h2>
          <ul className="activity-list">
            {data.activity.map((item) => (
              <li key={item.id}>
                <span
                  className={`dot-a${
                    item.tone === "warning"
                      ? " warn"
                      : item.tone === "danger"
                      ? " danger"
                      : ""
                  }`}
                />
                <div>
                  <strong>{item.title}</strong> — {item.detail}
                  <div className="time">{item.at}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <h2 style={{ margin: 0, flex: 1 }}>Clientes recientes</h2>
          <Link className="btn btn-secondary btn-sm" href={adminHref("/clientes", { host })}>
            Ver todos
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Último pago</th>
              </tr>
            </thead>
            <tbody>
              {data.recentClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <Link href={adminHref("/clientes", { host })}>{client.name}</Link>
                  </td>
                  <td>{client.plan}</td>
                  <td>
                    <StatusBadge status={client.status} />
                  </td>
                  <td>{client.lastPayment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes("activo")) return <span className="badge badge-green">{status}</span>;
  if (s.includes("pend") || s.includes("prueba") || s.includes("vencer"))
    return <span className="badge badge-warn">{status}</span>;
  if (s.includes("susp") || s.includes("baja"))
    return <span className="badge badge-danger">{status}</span>;
  return <span className="badge badge-navy">{status}</span>;
}
