import type { Metadata } from "next";
import Link from "next/link";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type DashboardResponse } from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
};

const EMPTY: DashboardResponse = {
  kpis: [],
  paymentsByDay: [],
  activity: [],
  recentClients: [],
};

export default async function DashboardPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let data: DashboardResponse | null = null;
  let loadError = false;
  if (token) {
    try {
      data = await adminApi.dashboard(token);
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }
  const view = data ?? EMPTY;

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

      {loadError ? (
        <div className="card">
          <p>No pudimos cargar el tablero. Intentá de nuevo.</p>
        </div>
      ) : null}

      <div className="kpi-grid">
        {view.kpis.length === 0 && !loadError ? (
          <div className="card">
            <p>No hay indicadores para mostrar.</p>
          </div>
        ) : (
          view.kpis.map((kpi) => (
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
          ))
        )}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div
            className="chart-placeholder"
            aria-label="Gráfico de pagos confirmados"
          >
            <div className="chart-label">Pagos confirmados (últimos 30 días)</div>
            {view.paymentsByDay.length === 0 ? (
              <p>No hay pagos para mostrar.</p>
            ) : (
              view.paymentsByDay.map((point, idx) => (
                <div
                  key={`${point.day}-${idx}`}
                  className="bar"
                  style={{ height: `${Math.min(100, Math.max(10, point.total))}%` }}
                />
              ))
            )}
          </div>
        </div>
        <div className="card">
          <h2>Actividad reciente</h2>
          {view.activity.length === 0 ? (
            <p>No hay actividad reciente.</p>
          ) : (
            <ul className="activity-list">
              {view.activity.map((item) => (
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
          )}
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
              {view.recentClients.length === 0 ? (
                <tr>
                  <td colSpan={4}>No hay clientes para mostrar.</td>
                </tr>
              ) : (
                view.recentClients.map((client) => (
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
                ))
              )}
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
