import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roles y permisos — Admin" };

const ROLES = [
  { name: "Super Admin", description: "Acceso total — clientes, orgs, planes, sistema", members: 2 },
  { name: "Operaciones", description: "Clientes, pagos, suscripciones", members: 3 },
  { name: "Soporte", description: "Lectura de clientes y orgs, sin cambios de plan", members: 4 },
  { name: "Finanzas", description: "Confirmación de pagos y reportes", members: 1 },
];

const STAFF = [
  {
    id: "s1",
    name: "Souvik Samanta",
    role: "Super Admin",
    email: "souvik@nexolia.com.ar",
    activity: "Activo hoy",
    tone: "positive" as const,
  },
  {
    id: "s2",
    name: "Lucía Fernández",
    role: "Operaciones",
    email: "lucia@nexolia.com.ar",
    activity: "Activo ayer",
    tone: "positive" as const,
  },
  {
    id: "s3",
    name: "Martín Ruiz",
    role: "Soporte",
    email: "martin@nexolia.com.ar",
    activity: "Invitación pendiente",
    tone: "warning" as const,
  },
  {
    id: "s4",
    name: "Carla Díaz",
    role: "Finanzas",
    email: "carla@nexolia.com.ar",
    activity: "Activo hace 3 d",
    tone: "positive" as const,
  },
];

export default function RolesPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Roles y permisos</h1>
          <p>Acceso del equipo Nexolia al portal admin</p>
        </div>
        <button className="btn btn-primary btn-sm" type="button">
          + Invitar staff
        </button>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h2>Roles del portal</h2>
          <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Descripción</th>
                  <th>Miembros</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r) => (
                  <tr key={r.name}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>{r.description}</td>
                    <td>{r.members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Staff Nexolia</h2>
          <ul className="activity-list" style={{ marginTop: "0.5rem" }}>
            {STAFF.map((s) => (
              <li key={s.id}>
                <span
                  className={`dot-a${s.tone === "warning" ? " warn" : ""}`}
                />
                <div>
                  <strong>{s.name}</strong> · {s.role}
                  <br />
                  <span className="muted">{s.email}</span>
                  <div className="time">{s.activity}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
