import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import {
  adminApi,
  type AdminOrganization,
  type AdminUser,
} from "@/lib/api";
import { OrganizacionesWorkspace } from "@/components/admin/OrganizacionesWorkspace";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

export const metadata: Metadata = { title: "Organizaciones y usuarios — Admin" };

export const dynamic = "force-dynamic";

export default async function OrganizacionesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let orgs: AdminOrganization[] = [];
  let users: AdminUser[] = [];
  let staffRole = "admin";
  let loadError: string | null = null;

  if (!token) {
    loadError = "Iniciá sesión para ver las organizaciones.";
  } else {
    try {
      const [orgRows, userRows, me] = await Promise.all([
        adminApi.organizations(token),
        adminApi.users(token),
        adminApi.me(token),
      ]);
      orgs = orgRows;
      users = userRows;
      staffRole = me.role || "admin";
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : "No pudimos cargar las organizaciones desde la API.";
    }
  }

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
          clientesHref={adminHref("/clientes", { host })}
          staffRole={staffRole}
        />
      ) : null}
    </>
  );
}
