import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminLead } from "@/lib/api";
import { formatARS, initialsFrom } from "@/lib/formatters";

export const metadata: Metadata = { title: "Clientes — Admin" };

interface ClientRow {
  id: string;
  name: string;
  plan: string;
  status: string;
  contact: string;
  location?: string;
  ownerName?: string;
  ownerContact?: string;
  planPrice?: string;
  orgLabel?: string;
  lastPayment?: string;
  nextDue?: string;
}

const FALLBACK: ClientRow[] = [
  {
    id: "c1",
    name: "Ferretería Villalba",
    plan: "Básico",
    status: "Activo",
    contact: "maria@villalba.com.ar",
    location: "Ferretería · Córdoba",
    ownerName: "María Villalba",
    ownerContact: "maria@villalba.com.ar · +54 351 555-1234",
    planPrice: `Básico · ${formatARS(69000)}/mes`,
    orgLabel: "Villalba SRL",
    lastPayment: `${formatARS(69000)} · transferencia · 28/08/2026`,
    nextDue: "28/09/2026",
  },
  { id: "c2", name: "Dietética Sol", plan: "Starter", status: "Pendiente de pago", contact: "info@dieteticasol.com" },
  { id: "c3", name: "Restaurante La Plaza", plan: "—", status: "Lead", contact: "contacto@laplaza.com.ar" },
  { id: "c4", name: "Clínica Norte", plan: "Pro", status: "Activo", contact: "admin@clinicanorte.com" },
  { id: "c5", name: "Veterinaria Paz", plan: "Básico", status: "En prueba", contact: "hola@veterinariapaz.com" },
  { id: "c6", name: "Taller El Rápido", plan: "Pro", status: "Suspendido", contact: "elrapido@gmail.com" },
];

export default async function ClientesPage() {
  const token = await getServerAccessToken();
  let clients: ClientRow[] = FALLBACK;

  if (token) {
    try {
      const leads = await adminApi.leads(token);
      if (leads.length > 0) {
        clients = leads.map(leadToRow);
      }
    } catch {
      clients = FALLBACK;
    }
  }

  const active = clients[0];
  const kpis = deriveKpis(clients);

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Clientes</h1>
          <p>Leads, suscripciones y estados de cuenta</p>
        </div>
        <button className="btn btn-primary btn-sm" type="button">
          + Nuevo lead
        </button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
            <div className={`delta${k.tone === "warning" ? " warn" : ""}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="split-view">
        <div className="list-panel">
          <div className="panel-toolbar">
            <input type="search" placeholder="Buscar cliente…" aria-label="Buscar cliente" />
            <select aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option>Lead</option>
              <option>Pendiente de pago</option>
              <option>En prueba</option>
              <option>Activo</option>
              <option>Suspendido</option>
            </select>
            <select aria-label="Filtrar por plan">
              <option value="">Todos los planes</option>
              <option>Starter</option>
              <option>Básico</option>
              <option>Pro</option>
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
                {clients.map((c, idx) => (
                  <tr key={c.id} className={idx === 0 ? "is-active" : undefined}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.plan}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>{c.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="detail-panel">
          <div className="avatar">{initialsFrom(active.name)}</div>
          <h2 style={{ margin: 0 }}>{active.name}</h2>
          <p
            className="muted"
            style={{ fontSize: "0.85rem", margin: "0.25rem 0 0" }}
          >
            {active.location || "Cliente"}
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
              <dd>{active.planPrice || active.plan}</dd>
            </div>
            {active.orgLabel && (
              <div>
                <dt>Organización</dt>
                <dd>
                  <a href="/admin/organizaciones">{active.orgLabel}</a>
                </dd>
              </div>
            )}
            <div>
              <dt>Contacto</dt>
              <dd>
                {active.ownerName || "—"}
                <br />
                <span className="muted">{active.ownerContact || active.contact}</span>
              </dd>
            </div>
            {active.lastPayment && (
              <div>
                <dt>Último pago</dt>
                <dd>{active.lastPayment}</dd>
              </div>
            )}
            {active.nextDue && (
              <div>
                <dt>Próximo vencimiento</dt>
                <dd>{active.nextDue}</dd>
              </div>
            )}
          </dl>
          <div className="detail-actions">
            <a className="btn btn-primary btn-sm" href="/admin/planes">
              Ver suscripción
            </a>
            <button className="btn btn-secondary btn-sm" type="button">
              Editar
            </button>
            <button className="btn btn-ghost btn-sm" type="button">
              Suspender
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function leadToRow(lead: AdminLead): ClientRow {
  return {
    id: lead.id,
    name: lead.business || lead.email,
    plan: lead.plan || "—",
    status: humanStatus(lead.status),
    contact: lead.email,
    location: lead.categoria,
  };
}

function humanStatus(status: string): string {
  switch (status) {
    case "new":
      return "Lead";
    case "contacted":
      return "En seguimiento";
    case "converted":
      return "Activo";
    case "lost":
      return "Suspendido";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function deriveKpis(clients: ClientRow[]) {
  const active = clients.filter((c) => c.status === "Activo").length;
  const trial = clients.filter((c) => /prueba/i.test(c.status)).length;
  const suspended = clients.filter((c) => /susp/i.test(c.status)).length;
  return [
    { label: "Activos", value: active, delta: "+6 este mes", tone: "positive" as const },
    { label: "En prueba", value: trial, delta: "3 por vencer", tone: "warning" as const },
    {
      label: "Suspendidos",
      value: suspended,
      delta: "2 por falta de pago",
      tone: "warning" as const,
    },
  ];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes("activo")) return <span className="badge badge-green">{status}</span>;
  if (s.includes("lead")) return <span className="badge badge-navy">{status}</span>;
  if (s.includes("susp")) return <span className="badge badge-danger">{status}</span>;
  if (s.includes("pend") || s.includes("prueba") || s.includes("vencer"))
    return <span className="badge badge-warn">{status}</span>;
  return <span className="badge badge-muted">{status}</span>;
}
