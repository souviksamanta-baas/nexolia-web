"use client";

import { useState } from "react";
import type { AdminOrganization } from "@/lib/api";

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
}: {
  orgs: AdminOrganization[];
  users: UserRow[];
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
                <th>Owner</th>
                <th>Plan</th>
                <th>Miembros</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, idx) => (
                <tr key={org.id} className={idx === 0 ? "is-active" : undefined}>
                  <td>
                    <strong>{org.name}</strong>
                  </td>
                  <td>
                    {org.ownerName || (
                      <span className="badge badge-warn">Sin owner</span>
                    )}
                  </td>
                  <td>{org.plan}</td>
                  <td>{org.members}</td>
                </tr>
              ))}
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
