import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminLead } from "@/lib/api";
import { initialsFrom } from "@/lib/formatters";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";
import { ConvertLeadButton } from "@/components/admin/ConvertLeadButton";
import { ProvisionPendingLeadsButton } from "@/components/admin/ProvisionPendingLeadsButton";

export const metadata: Metadata = { title: "Clientes — Admin" };

export const dynamic = "force-dynamic";

interface ClientRow {
  id: string;
  name: string;
  plan: string;
  status: string;
  rawStatus: string;
  contact: string;
  location?: string;
  organizationId?: string | null;
  createdAt?: string;
}

export default async function ClientesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let clients: ClientRow[] = [];
  let loadError: string | null = null;

  if (!token) {
    loadError = "Iniciá sesión para ver los leads.";
  } else {
    try {
      const leads = await adminApi.leads(token);
      clients = leads.map(leadToRow);
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : "No pudimos cargar los leads desde la API.";
    }
  }

  const active = clients[0] ?? null;
  const kpis = deriveKpis(clients);
  const pendingCount = clients.filter(
    (c) => c.rawStatus !== "converted" && !c.organizationId,
  ).length;

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Clientes</h1>
          <p>Leads de /comenzar y cuentas convertidas</p>
        </div>
        <ProvisionPendingLeadsButton pendingCount={pendingCount} />
      </div>

      {loadError && <p className="login-error">{loadError}</p>}

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
            <div className={`delta${k.tone === "warning" ? " warn" : ""}`}>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="split-view">
        <div className="list-panel">
          <div className="panel-toolbar">
            <input
              type="search"
              placeholder="Buscar cliente…"
              aria-label="Buscar cliente"
            />
            <select aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option>Lead</option>
              <option>En seguimiento</option>
              <option>Activo</option>
              <option>Suspendido</option>
            </select>
            <select aria-label="Filtrar por plan">
              <option value="">Todos los planes</option>
              <option>basico</option>
              <option>pro</option>
              <option>max</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Contacto</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      No hay leads todavía. Los altas de{" "}
                      <a href="https://nexolia.com.ar/comenzar">/comenzar</a>{" "}
                      aparecen acá.
                    </td>
                  </tr>
                ) : (
                  clients.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={idx === 0 ? "is-active" : undefined}
                    >
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{planLabel(c.plan)}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>{c.contact}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="detail-panel">
          {active ? (
            <>
              <div className="avatar">{initialsFrom(active.name)}</div>
              <h2 style={{ margin: 0 }}>{active.name}</h2>
              <p
                className="muted"
                style={{ fontSize: "0.85rem", margin: "0.25rem 0 0" }}
              >
                {active.location || "Lead"}
              </p>
              <dl className="detail-meta">
                <div>
                  <dt>Estado</dt>
                  <dd>
                    <StatusBadge status={active.status} />
                  </dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{planLabel(active.plan)}</dd>
                </div>
                {active.organizationId && (
                  <div>
                    <dt>Organización</dt>
                    <dd>
                      <a href={adminHref("/organizaciones", { host })}>
                        Ver organización
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Contacto</dt>
                  <dd>
                    <span className="muted">{active.contact}</span>
                  </dd>
                </div>
                {active.createdAt && (
                  <div>
                    <dt>Alta</dt>
                    <dd>{formatDate(active.createdAt)}</dd>
                  </div>
                )}
              </dl>
              <div className="detail-actions">
                {active.rawStatus !== "converted" && !active.organizationId ? (
                  <ConvertLeadButton
                    leadId={active.id}
                    orgName={active.name}
                    ownerEmail={active.contact}
                  />
                ) : (
                  <a
                    className="btn btn-primary btn-sm"
                    href={adminHref("/organizaciones", { host })}
                  >
                    Ver organizaciones
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="muted">Seleccioná un lead para ver el detalle.</p>
          )}
        </aside>
      </div>
    </>
  );
}

function leadToRow(lead: AdminLead): ClientRow {
  return {
    id: lead.id,
    name: lead.business || lead.orgName || lead.email,
    plan: lead.plan || "—",
    status: humanStatus(lead.status),
    rawStatus: lead.status,
    contact: lead.email,
    location: lead.categoria || undefined,
    organizationId: lead.organizationId,
    createdAt: lead.createdAt,
  };
}

function planLabel(plan: string): string {
  switch (plan) {
    case "basico":
      return "Básico";
    case "pro":
      return "Pro";
    case "enterprise":
    case "max":
    case "advanced":
      return "Enterprise";
    case "starter":
      return "Starter";
    default:
      return plan || "—";
  }
}

function humanStatus(status: string): string {
  switch (status) {
    case "new":
      return "Lead";
    case "contacted":
      return "En seguimiento";
    case "converted":
      return "Convertido";
    case "lost":
      return "Perdido";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function deriveKpis(clients: ClientRow[]) {
  const leads = clients.filter((c) => c.rawStatus === "new").length;
  const converted = clients.filter((c) => c.rawStatus === "converted").length;
  const other = clients.length - leads - converted;
  return [
    {
      label: "Leads nuevos",
      value: leads,
      delta: "Pendientes de org",
      tone: "warning" as const,
    },
    {
      label: "Convertidos",
      value: converted,
      delta: "Con organización",
      tone: "positive" as const,
    },
    {
      label: "Otros",
      value: other,
      delta: "Seguimiento / otros",
      tone: "muted" as const,
    },
  ];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes("convert") || s.includes("activo"))
    return <span className="badge badge-green">{status}</span>;
  if (s.includes("lead") || s.includes("seguimiento"))
    return <span className="badge badge-navy">{status}</span>;
  if (s.includes("perd") || s.includes("susp"))
    return <span className="badge badge-danger">{status}</span>;
  return <span className="badge badge-muted">{status}</span>;
}
