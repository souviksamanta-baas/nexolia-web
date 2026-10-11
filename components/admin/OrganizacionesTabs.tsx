"use client";

import { useState } from "react";
import type { AdminOrganization } from "@/lib/api";
import {
  orgLifecycleBadgeClass,
  orgLifecycleLabel,
  orgLifecycleRowClass,
  resolveOrgLifecycleState,
} from "@/lib/org-lifecycle-state";

interface UserRow {
  id: string;
  name: string;
  email: string;
  org: string;
  role: string;
}

/** Days since org creation for trial / pending_payment; otherwise null. */
function daysInTrialOrPending(org: AdminOrganization): number | null {
  const state = resolveOrgLifecycleState(org);
  if (state !== "trial" && state !== "pending_payment") return null;
  if (!org.createdAt) return null;
  const created = new Date(org.createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const ms = Date.now() - created.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function OrganizacionesTabs({
  orgs,
  users,
  selectedOrgId,
  onSelectOrg,
}: {
  orgs: AdminOrganization[];
  users: UserRow[];
  selectedOrgId?: string;
  onSelectOrg?: (orgId: string) => void;
}) {
  const [tab, setTab] = useState<"orgs" | "users">("orgs");

  return (
    <div className="list-panel">
      <div className="tabs" role="tablist">
        <button
          type="button"
          className={`tab${tab === "orgs" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "orgs"}
          onClick={() => setTab("orgs")}
        >
          Orgs
        </button>
        <button
          type="button"
          className={`tab${tab === "users" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "users"}
          onClick={() => setTab("users")}
        >
          Usuarios
        </button>
      </div>
      <div className="panel-toolbar">
        <input type="search" placeholder="Buscar…" />
      </div>

      {tab === "orgs" ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Organización</th>
                <th>Estado</th>
                <th>En prueba (días)</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Miembros</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => {
                const state = resolveOrgLifecycleState(org);
                const selected = org.id === selectedOrgId;
                const trialDays = daysInTrialOrPending(org);
                return (
                  <tr
                    key={org.id}
                    className={[
                      orgLifecycleRowClass(state),
                      selected ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ cursor: onSelectOrg ? "pointer" : undefined }}
                    onClick={() => onSelectOrg?.(org.id)}
                  >
                    <td>
                      <strong>{org.name}</strong>
                    </td>
                    <td>
                      <span className={orgLifecycleBadgeClass(state)}>
                        {orgLifecycleLabel(state)}
                      </span>
                    </td>
                    <td>
                      {trialDays != null ? (
                        trialDays
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {org.ownerName || org.ownerEmail || (
                        <span className="badge badge-warn">Sin owner</span>
                      )}
                    </td>
                    <td>{org.plan || "—"}</td>
                    <td>{org.members}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Org</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className={idx === 0 ? "is-active" : undefined}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.org}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
