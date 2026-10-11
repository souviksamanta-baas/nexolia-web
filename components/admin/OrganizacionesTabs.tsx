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
                <th>Owner</th>
                <th>Plan</th>
                <th>Miembros</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => {
                const state = resolveOrgLifecycleState(org);
                const selected = org.id === selectedOrgId;
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
