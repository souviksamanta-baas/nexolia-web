import type { Metadata } from "next";
import Link from "next/link";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type DashboardResponse } from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";
import { formatARS } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
};

export const dynamic = "force-dynamic";

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
  const maxPayment = Math.max(0, ...view.paymentsByDay.map((p) => p.total));
  const hasPaymentActivity = view.paymentsByDay.some((p) => p.total > 0);

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
            {!hasPaymentActivity ? (
              <p>No hay pagos confirmados en los últimos 30 días.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 140,
                  marginTop: 12,
                }}
              >
                {view.paymentsByDay.map((point, idx) => {
                  const heightPct =
                    maxPayment > 0
                      ? Math.max(4, Math.round((point.total / maxPayment) * 100))
                      : 4;
                  return (
                    <div
                      key={`${point.day}-${idx}`}
                      className="bar"
                      title={`${point.day}: ${formatARS(point.total)}`}
                      style={{
                        height: `${heightPct}%`,
                        flex: 1,
                        minWidth: 2,
                        opacity: point.total > 0 ? 1 : 0.25,
                      }}
                    />
                  );
                })}
              </div>
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
          <Link
            className="btn btn-secondary btn-sm"
            href={adminHref("/organizaciones", { host })}
          >
            Ver organizaciones
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
                      <Link href={adminHref("/organizaciones", { host })}>
                        {client.name}
                      </Link>
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
  if (s.includes("susp") || s.includes("baja") || s.includes("paus"))
    return <span className="badge badge-danger">{status}</span>;
  return <span className="badge badge-navy">{status}</span>;
}
