import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FabGrok } from "@/components/admin/FabGrok";
import { SidebarOverlay } from "@/components/admin/SidebarOverlay";
import { getSupabaseServerClient, getServerAccessToken } from "@/lib/supabase/server";
import { adminApi } from "@/lib/api";
import { adminHref } from "@/lib/admin-paths";

// The portal always reads the current session cookie and calls Nest, so it
// can't be statically rendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Portal group layout: enforces staff auth against Supabase (session cookie)
 * AND the Nest `/admin/me` gate. Non-staff users are redirected to the login
 * page, which is intentionally rendered OUTSIDE this group so it isn't shelled.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userLabel: string | undefined;
  let roleLabel: string | undefined;
  const host = (await headers()).get("host");
  const loginPath = adminHref("/login", { host });

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect(loginPath);
    }

    const token = await getServerAccessToken();
    if (!token) {
      redirect(loginPath);
    }

    try {
      const me = await adminApi.me(token);
      userLabel = me.name || me.email;
      roleLabel = friendlyRole(me.role);
    } catch {
      // Nest rejected the session (not staff / stale token). Sign out via a
      // client redirect to login where the user can retry.
      redirect(loginPath);
    }
  } catch (err) {
    // Supabase env vars aren't set — fail closed to login. This lets a dev
    // preview the login screen without a working API.
    if (
      err instanceof Error &&
      err.message.includes("Supabase env vars missing")
    ) {
      redirect(loginPath);
    }
    throw err;
  }

  return (
    <div className="admin-body">
      <SidebarOverlay />
      <div className="admin-app">
        <Sidebar />
        <div className="admin-main">
          <AdminHeader userLabel={userLabel} roleLabel={roleLabel ?? "Super Admin"} />
          <main className="admin-content">{children}</main>
        </div>
      </div>
      <FabGrok />
    </div>
  );
}

function friendlyRole(role: string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "operations":
      return "Operaciones";
    case "support":
      return "Soporte";
    case "finance":
      return "Finanzas";
    default:
      return role.replace(/_/g, " ");
  }
}
