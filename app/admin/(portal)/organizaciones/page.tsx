import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminOrganization } from "@/lib/api";
import { OrganizacionesTabs } from "@/components/admin/OrganizacionesTabs";
import { initialsFrom } from "@/lib/formatters";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = { title: "Organizaciones y usuarios — Admin" };

export const dynamic = "force-dynamic";

export default async function OrganizacionesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let orgs: AdminOrganization[] = [];
  let loadError: string | null = null;

  if (!token) {
    loadError = "Iniciá sesión para ver las organizaciones.";
  } else {
    try {
      orgs = await adminApi.organizations(token);
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : "No pudimos cargar las organizaciones desde la API.";
    }
  }

  const users = orgs.flatMap((org) =>
    org.ownerEmail
      ? [
          {
            id: `${org.id}-owner`,
            name: org.ownerName || org.ownerEmail.split("@")[0],
            email: org.ownerEmail,
            org: org.name,
            role: "Owner",
          },
        ]
      : [],
  );

  const active = orgs[0] ?? null;

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Organizaciones y usuarios</h1>
          <p>Orgs provisionadas desde leads y membresías</p>
        </div>
      </div>

      {loadError && <p className="login-error">{loadError}</p>}

      <div className="split-view">
        {orgs.length === 0 && !loadError ? (
          <div className="list-panel">
            <p className="muted" style={{ padding: "1rem" }}>
              Todavía no hay organizaciones. Los leads de{" "}
              <a href={adminHref("/clientes", { host })}>Clientes</a> se
              convierten en orgs al completar /comenzar (o con “Crear
              organización”).
            </p>
          </div>
        ) : (
          <OrganizacionesTabs orgs={orgs} users={users} />
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
                <span className="badge badge-navy">
                  {active.plan || "Sin plan"}
                </span>
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
                    <a href={adminHref("/clientes", { host })}>
                      Ver lead / cliente
                    </a>
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="muted">Seleccioná una organización para ver el detalle.</p>
          )}
        </aside>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <span className="badge badge-green">Activa</span>;
  if (status === "trial")
    return <span className="badge badge-warn">Prueba</span>;
  if (status === "pending_payment")
    return <span className="badge badge-warn">Pendiente de pago</span>;
  if (status === "suspended")
    return <span className="badge badge-danger">Suspendida</span>;
  return <span className="badge badge-muted">{status}</span>;
}
