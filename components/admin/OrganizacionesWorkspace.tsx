"use client";

import { useMemo, useState } from "react";
import type { AdminOrganization } from "@/lib/api";
import { initialsFrom } from "@/lib/formatters";
import {
  orgLifecycleBadgeClass,
  orgLifecycleLabel,
  resolveOrgLifecycleState,
} from "@/lib/org-lifecycle-state";
import { ProvisionOpenAiKeyButton } from "@/components/admin/ProvisionOpenAiKeyButton";
import { OrgLifecycleActions } from "@/components/admin/OrgLifecycleActions";
import { OrganizacionesTabs } from "@/components/admin/OrganizacionesTabs";

interface UserRow {
  id: string;
  name: string;
  email: string;
  org: string;
  role: string;
}

function StatusBadge({ org }: { org: AdminOrganization }) {
  const state = resolveOrgLifecycleState(org);
  return (
    <span className={orgLifecycleBadgeClass(state)}>
      {orgLifecycleLabel(state)}
    </span>
  );
}

function formatDeletedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrganizacionesWorkspace({
  orgs,
  users,
  clientesHref,
  staffRole,
}: {
  orgs: AdminOrganization[];
  users: UserRow[];
  clientesHref: string;
  staffRole: string;
}) {
  const defaultId =
    orgs.find((org) => resolveOrgLifecycleState(org) !== "deleted")?.id ??
    orgs[0]?.id ??
    null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const active = useMemo(
    () => orgs.find((org) => org.id === selectedId) ?? orgs.find((org) => org.id === defaultId) ?? orgs[0] ?? null,
    [defaultId, orgs, selectedId],
  );
  const activeState = active ? resolveOrgLifecycleState(active) : null;
  const isDeleted = activeState === "deleted";

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
              <StatusBadge org={active} />
              {!isDeleted ? (
                <span className="badge badge-navy">{active.plan || "Sin plan"}</span>
              ) : null}
            </div>
            <dl className="detail-meta">
              {isDeleted ? (
                <div>
                  <dt>Eliminada</dt>
                  <dd>{formatDeletedAt(active.deletedAt) || "Fecha no disponible"}</dd>
                </div>
              ) : (
                <>
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
                    <dt>Licencia hasta</dt>
                    <dd>
                      {formatDeletedAt(active.licenseExpiresAt) || (
                        <span className="muted">—</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Cliente origen</dt>
                    <dd>
                      <a href={clientesHref}>Ver lead / cliente</a>
                    </dd>
                  </div>
                </>
              )}
            </dl>
            {isDeleted ? (
              <p className="muted" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
                Organización eliminada. Solo queda un registro mínimo en auditoría
                (sin datos del negocio ni del owner), alineado con Ley 25.326.
              </p>
            ) : (
              <>
                <OrgLifecycleActions
                  organization={active}
                  staffRole={staffRole}
                />
                <ProvisionOpenAiKeyButton organization={active} />
              </>
            )}
          </>
        ) : (
          <p className="muted">Seleccioná una organización para ver el detalle.</p>
        )}
      </aside>
    </div>
  );
}
