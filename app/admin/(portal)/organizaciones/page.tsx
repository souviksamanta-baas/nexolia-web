import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminOrganization } from "@/lib/api";
import {
  OrganizacionesWorkspace,
  organizacionesClientesHref,
} from "@/components/admin/OrganizacionesWorkspace";
import { headers } from "next/headers";

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

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Organizaciones y usuarios</h1>
          <p>Orgs provisionadas desde leads y membresías</p>
        </div>
      </div>

      {loadError && <p className="login-error">{loadError}</p>}

      {!loadError ? (
        <OrganizacionesWorkspace
          orgs={orgs}
          users={users}
          clientesHref={organizacionesClientesHref(host)}
        />
      ) : null}
    </>
  );
}
