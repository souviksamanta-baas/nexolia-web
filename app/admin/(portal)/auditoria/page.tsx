import type { Metadata } from "next";
import { formatARS } from "@/lib/formatters";

export const metadata: Metadata = { title: "Auditoría — Admin" };

interface AuditRow {
  id: string;
  actor: string;
  action: string;
  resource: string;
  via: "ui" | "grok";
  at: string;
}

const AUDIT: AuditRow[] = [
  { id: "1", actor: "Lucía Fernández", action: "Confirmó pago", resource: `Dietética Sol · ${formatARS(29000)}`, via: "ui", at: "03/09/2026 14:32" },
  { id: "2", actor: "Grok", action: "Listó leads pendientes", resource: "Dashboard", via: "grok", at: "03/09/2026 14:18" },
  { id: "3", actor: "Souvik Samanta", action: "Creó organización", resource: "Clínica Norte SA", via: "ui", at: "03/09/2026 11:05" },
  { id: "4", actor: "Grok", action: "Sugirió asignar owner", resource: "Dietética Sol", via: "grok", at: "02/09/2026 17:44" },
  { id: "5", actor: "Carla Díaz", action: "Confirmó pago", resource: `Ferretería Villalba · ${formatARS(69000)}`, via: "ui", at: "02/09/2026 10:20" },
  { id: "6", actor: "Lucía Fernández", action: "Suspendió cliente", resource: "Taller El Rápido", via: "ui", at: "01/09/2026 16:08" },
  { id: "7", actor: "Grok", action: "Resumió licencias por vencer", resource: "5 clientes · Pro/Básico", via: "grok", at: "01/09/2026 09:00" },
];

export default function AuditoriaPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Auditoría</h1>
          <p>Registro de acciones del equipo y del asistente Grok</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="panel-toolbar">
          <input
            type="search"
            placeholder="Buscar actor o acción…"
            aria-label="Buscar"
            style={{ flex: 1 }}
          />
          <select aria-label="Filtrar vía">
            <option value="">Todas las vías</option>
            <option>ui</option>
            <option>grok</option>
          </select>
          <select aria-label="Filtrar período">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Todo</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Acción</th>
                <th>Recurso</th>
                <th>Vía</th>
                <th>Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT.map((row) => (
                <tr key={row.id}>
                  <td>{row.actor}</td>
                  <td>{row.action}</td>
                  <td>{row.resource}</td>
                  <td>
                    <span
                      className={
                        row.via === "grok" ? "badge badge-green" : "badge badge-navy"
                      }
                    >
                      {row.via}
                    </span>
                  </td>
                  <td>{row.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
