import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminOrganization } from "@/lib/api";
import { OrganizacionesTabs } from "@/components/admin/OrganizacionesTabs";
import { initialsFrom } from "@/lib/formatters";

export const metadata: Metadata = { title: "Organizaciones y usuarios — Admin" };

const FALLBACK_ORGS: AdminOrganization[] = [
  { id: "o1", name: "Ferretería Villalba", ownerName: "María Villalba", plan: "Básico", members: 3, status: "active" },
  { id: "o2", name: "Clínica Norte", ownerName: "Dr. Ruiz", plan: "Pro", members: 12, status: "active" },
  { id: "o3", name: "Dietética Sol", plan: "Starter", members: 0, status: "trial" },
  { id: "o4", name: "Taller El Rápido", ownerName: "Luis Méndez", plan: "Pro", members: 5, status: "active" },
];

const FALLBACK_USERS = [
  { id: "u1", name: "María Villalba", email: "maria@ferreteriavillalba.com.ar", org: "Ferretería Villalba", role: "Owner" },
  { id: "u2", name: "Juan Pérez", email: "juan@ferreteriavillalba.com.ar", org: "Ferretería Villalba", role: "Staff" },
  { id: "u3", name: "Dr. Ruiz", email: "ruiz@clinicanorte.com.ar", org: "Clínica Norte", role: "Owner" },
  { id: "u4", name: "Luis Méndez", email: "luis@tallerelrapido.com.ar", org: "Taller El Rápido", role: "Owner" },
];

export default async function OrganizacionesPage() {
  const token = await getServerAccessToken();
  let orgs: AdminOrganization[] = FALLBACK_ORGS;
  if (token) {
    try {
      const res = await adminApi.organizations(token);
      if (res.length) orgs = res;
    } catch {
      orgs = FALLBACK_ORGS;
    }
  }

  const active = orgs[0];

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Organizaciones y usuarios</h1>
          <p>Orgs provisionadas y membresías</p>
        </div>
      </div>

      <div className="split-view">
        <OrganizacionesTabs orgs={orgs} users={FALLBACK_USERS} />

        <aside className="detail-panel">
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
            <span className="badge badge-navy">{active.plan}</span>
          </div>
          <dl className="detail-meta">
            <div>
              <dt>Owner</dt>
              <dd>
                {active.ownerName || (
                  <span className="badge badge-warn">Sin owner</span>
                )}
              </dd>
            </div>
            <div>
              <dt>CUIT</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt>Miembros</dt>
              <dd>{active.members} usuarios</dd>
            </div>
            <div>
              <dt>Cliente origen</dt>
              <dd>
                <a href="/admin/clientes">Ver lead / cliente</a>
              </dd>
            </div>
          </dl>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" type="button">
              Asignar owner
            </button>
            <button className="btn btn-secondary btn-sm" type="button">
              Invitar usuario
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <span className="badge badge-green">Activa</span>;
  if (status === "trial") return <span className="badge badge-warn">Prueba</span>;
  if (status === "suspended") return <span className="badge badge-danger">Suspendida</span>;
  return <span className="badge badge-muted">{status}</span>;
}
