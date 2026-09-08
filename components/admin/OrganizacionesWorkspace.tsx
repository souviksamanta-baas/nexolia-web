"use client";

import { useMemo, useState } from "react";
import type { AdminOrganization } from "@/lib/api";
import { initialsFrom } from "@/lib/formatters";
import { adminHref } from "@/lib/admin-paths";
import { ProvisionOpenAiKeyButton } from "@/components/admin/ProvisionOpenAiKeyButton";
import { OrganizacionesTabs } from "@/components/admin/OrganizacionesTabs";

interface UserRow {
  id: string;
  name: string;
  email: string;
  org: string;
  role: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <span className="badge badge-green">Activa</span>;
  if (status === "trial")
    return <span className="badge badge-warn">Prueba</span>;
  if (status === "pending_payment")
    return <span className="badge badge-warn">Pendiente de pago</span>;
  if (status === "suspended" || status === "paused")
    return <span className="badge badge-danger">Suspendida</span>;
  return <span className="badge badge-muted">{status}</span>;
}

export function OrganizacionesWorkspace({
  orgs,
  users,
  clientesHref,
}: {
  orgs: AdminOrganization[];
  users: UserRow[];
  clientesHref: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(orgs[0]?.id ?? null);
  const active = useMemo(
    () => orgs.find((org) => org.id === selectedId) ?? orgs[0] ?? null,
    [orgs, selectedId],
  );

  return (
    <div className="split-view">
      {orgs.length === 0 ? (
        <div className="list-panel">
          <p className="muted" style={{ padding: "1rem" }}>
            Todavía no hay organizaciones. Los leads de{" "}
            <a href={clientesHref}>Clientes</a> se convierten en orgs al completar
            /comenzar (o con “Crear organización”).
          </p>
        </div>
      ) : (
        <OrganizacionesTabs
          orgs={orgs}
          users={users}
          selectedOrgId={active?.id}
          onSelectOrg={setSelectedId}
        />
      )}

      <aside className="detail-panel">
        {active ? (
          <>
            <div className="avatar">{initialsFrom(active.name)}</div>
            <h2>{active.name}</h2>
            <p className="secondary" style={{ margin: 0 }}>
              Org · Argentina
            </p>
            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              <StatusBadge status={active.status} />
              <span className="badge badge-navy">{active.plan || "Sin plan"}</span>
            </div>
            <dl className="detail-meta">
              <div>
                <dt>Owner</dt>
                <dd>
                  {active.ownerEmail || active.ownerName || (
                    <span className="badge badge-warn">Sin owner</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Miembros</dt>
                <dd>{active.members} usuarios</dd>
              </div>
              <div>
                <dt>Cliente origen</dt>
                <dd>
                  <a href={clientesHref}>Ver lead / cliente</a>
                </dd>
              </div>
            </dl>
            <ProvisionOpenAiKeyButton organization={active} />
          </>
        ) : (
          <p className="muted">Seleccioná una organización para ver el detalle.</p>
        )}
      </aside>
    </div>
  );
}

/** Keep adminHref import used by page for host-aware links. */
export function organizacionesClientesHref(host: string | null): string {
  return adminHref("/clientes", { host });
}
