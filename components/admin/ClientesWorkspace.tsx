"use client";

import { useMemo, useState } from "react";
import { ConvertLeadButton } from "@/components/admin/ConvertLeadButton";
import { RejectLeadButton } from "@/components/admin/RejectLeadButton";
import { initialsFrom } from "@/lib/formatters";

export interface ClientRow {
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

function isPendingLead(row: ClientRow): boolean {
  return (
    !row.organizationId &&
    row.rawStatus !== "converted" &&
    row.rawStatus !== "rejected" &&
    row.rawStatus !== "closed" &&
    row.rawStatus !== "lost"
  );
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
  if (
    s.includes("rechaz") ||
    s.includes("perd") ||
    s.includes("cerrad") ||
    s.includes("susp")
  )
    return <span className="badge badge-danger">{status}</span>;
  return <span className="badge badge-muted">{status}</span>;
}

export function ClientesWorkspace({
  clients,
  organizacionesHref,
}: {
  clients: ClientRow[];
  organizacionesHref: string;
}) {
  const defaultId = clients[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const active = useMemo(
    () =>
      clients.find((c) => c.id === selectedId) ??
      clients.find((c) => c.id === defaultId) ??
      clients[0] ??
      null,
    [clients, defaultId, selectedId],
  );
  const canActOnLead = active ? isPendingLead(active) : false;

  return (
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
            <option>Convertido</option>
            <option>Rechazado</option>
          </select>
          <select aria-label="Filtrar por plan">
            <option value="">Todos los planes</option>
            <option>basico</option>
            <option>pro</option>
            <option>enterprise</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Fecha de alta</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    No hay leads todavía. Los altas de{" "}
                    <a href="https://nexolia.com.ar/comenzar">/comenzar</a>{" "}
                    aparecen acá.
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const selected = active?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      className={selected ? "is-active" : undefined}
                      onClick={() => setSelectedId(c.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{planLabel(c.plan)}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.createdAt ? (
                          formatDate(c.createdAt)
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>{c.contact}</td>
                    </tr>
                  );
                })
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
              {active.organizationId ? (
                <div>
                  <dt>Organización</dt>
                  <dd>
                    <a href={organizacionesHref}>Ver organización</a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Contacto</dt>
                <dd>
                  <span className="muted">{active.contact}</span>
                </dd>
              </div>
              <div>
                <dt>Fecha de alta</dt>
                <dd>
                  {active.createdAt ? formatDate(active.createdAt) : "—"}
                </dd>
              </div>
            </dl>
            <div
              className="detail-actions"
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
            >
              {canActOnLead ? (
                <>
                  <ConvertLeadButton
                    leadId={active.id}
                    orgName={active.name}
                    ownerEmail={active.contact}
                  />
                  <RejectLeadButton leadId={active.id} orgName={active.name} />
                </>
              ) : active.organizationId ? (
                <a
                  className="btn btn-primary btn-sm"
                  href={organizacionesHref}
                >
                  Ver organizaciones
                </a>
              ) : (
                <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                  Esta solicitud está {active.status.toLowerCase()}.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="muted">Seleccioná un lead para ver el detalle.</p>
        )}
      </aside>
    </div>
  );
}
