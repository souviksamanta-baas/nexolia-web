import type { Metadata } from "next";
import Link from "next/link";
import { GrokPanel } from "@/components/admin/GrokPanel";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type DashboardResponse } from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = {
  title: "Dashboard + Grok — Admin",
};

export default async function DashboardGrokPage() {
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
  const kpis = data?.kpis ?? [];
  const activity = data?.activity ?? [];

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Dashboard</h1>
          <p>Asistente Grok activo — consultas operativas v1</p>
        </div>
        <Link className="btn btn-secondary btn-sm" href={adminHref("/dashboard", { host })}>
          Cerrar Grok
        </Link>
      </div>

      <div className="grok-layout">
        <div>
          {loadError ? (
            <div className="card">
              <p>No pudimos cargar el tablero. Intentá de nuevo.</p>
            </div>
          ) : null}

          <div className="kpi-grid">
            {kpis.length === 0 && !loadError ? (
              <div className="card">
                <p>No hay indicadores para mostrar.</p>
              </div>
            ) : (
              kpis.map((kpi) => (
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

          <div className="card">
            <h2>Actividad reciente</h2>
            {activity.length === 0 ? (
              <p>No hay actividad reciente.</p>
            ) : (
              <ul className="activity-list">
                {activity.map((item) => (
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

        <GrokPanel />
      </div>
    </>
  );
}
