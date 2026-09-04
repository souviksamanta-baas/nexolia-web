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

const FALLBACK_KPIS = [
  { label: "Clientes activos", value: 128, delta: "+6 este mes", tone: "positive" as const },
  { label: "En prueba", value: 14, delta: "3 por vencer", tone: "positive" as const },
  { label: "Pagos por confirmar", value: 7, delta: "2 hace más de 48 h", tone: "warning" as const },
  { label: "Licencias por vencer", value: 5, delta: "próximos 15 días", tone: "warning" as const },
];

export default async function DashboardGrokPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let data: DashboardResponse | null = null;
  if (token) {
    try {
      data = await adminApi.dashboard(token);
    } catch {
      data = null;
    }
  }
  const kpis = data?.kpis ?? FALLBACK_KPIS;
  const activity =
    data?.activity ?? [
      {
        id: "a1",
        kind: "lead",
        title: "Lead nuevo",
        detail: "Ferretería Villalba (Básico)",
        at: "hace 12 min",
        tone: "positive" as const,
      },
      {
        id: "a2",
        kind: "payment",
        title: "Pago por confirmar",
        detail: "Dietética Sol · $69.000",
        at: "hace 45 min",
        tone: "warning" as const,
      },
      {
        id: "a3",
        kind: "org",
        title: "Org sin owner",
        detail: "Dietética Sol",
        at: "hace 1 h",
        tone: "danger" as const,
      },
    ];

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
          <div className="kpi-grid">
            {kpis.map((kpi) => (
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

          <div className="card">
            <h2>Actividad reciente</h2>
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
          </div>
        </div>

        <GrokPanel />
      </div>
    </>
  );
}
