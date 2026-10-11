import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminPlan } from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";
import { PlanesEditor } from "@/components/admin/PlanesEditor";

export const metadata: Metadata = { title: "Planes y suscripciones — Admin" };

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let plans: AdminPlan[] = [];
  let loadError = false;
  if (token) {
    try {
      plans = await adminApi.plans(token);
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <>
      {loadError ? (
        <div className="card">
          <p>No pudimos cargar los planes. Intentá de nuevo.</p>
        </div>
      ) : null}

      {!loadError && plans.length === 0 ? (
        <div className="card">
          <p>No hay planes para mostrar.</p>
        </div>
      ) : null}

      {!loadError && plans.length > 0 ? <PlanesEditor plans={plans} /> : null}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <h2 style={{ margin: 0, flex: 1 }}>Suscripciones</h2>
          <a
            className="btn btn-secondary btn-sm"
            href={adminHref("/organizaciones", { host })}
          >
            Ver organizaciones
          </a>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Organización</th>
                <th>Plan</th>
                <th>Ciclo</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Próximo cobro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6}>No hay suscripciones para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
