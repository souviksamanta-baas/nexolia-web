import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type StartupSample } from "@/lib/api";

export const metadata: Metadata = {
  title: "Rendimiento — Admin",
};

export const dynamic = "force-dynamic";

const SLOW_STALL_MS = 300;

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("es-AR", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function formatMs(value: number | null): string {
  if (value == null) {
    return "Sin toque";
  }
  return `${new Intl.NumberFormat("es-AR").format(value)} ms`;
}

export default async function RendimientoPage() {
  const token = await getServerAccessToken();
  let rows: StartupSample[] = [];
  let loadError = false;

  if (token) {
    try {
      rows = await adminApi.startupSamples(token);
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Rendimiento</h1>
          <p>Cada vez que alguien abre la app, queda una medición de los primeros 20 segundos.</p>
        </div>
      </div>

      {loadError ? (
        <div className="card">
          <p>No pudimos cargar las mediciones. Intentá de nuevo.</p>
        </div>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <div className="card">
          <p>Todavía no hay mediciones. Van a aparecer cuando un teléfono abra la app.</p>
        </div>
      ) : null}

      {!loadError && rows.length > 0 ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Modelo</th>
                <th>Android</th>
                <th>Versión</th>
                <th>Peor pausa</th>
                <th>Primer toque</th>
                <th>Cuándo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const slow = row.maxStallMs > SLOW_STALL_MS;
                return (
                  <tr key={row.id}>
                    <td>{row.organizationName}</td>
                    <td>{row.deviceModel || "—"}</td>
                    <td>{row.osVersion || row.platform}</td>
                    <td>{row.appVersion || "—"}</td>
                    <td>
                      <span className={slow ? "badge badge-danger" : "badge badge-green"}>
                        {formatMs(row.maxStallMs)}
                      </span>
                    </td>
                    <td>{formatMs(row.timeToFirstTapMs)}</td>
                    <td>{formatWhen(row.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
