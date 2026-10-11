import type { Metadata } from "next";
import { getServerAccessToken } from "@/lib/supabase/server";
import { adminApi, type AdminLead } from "@/lib/api";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";
import { ProvisionPendingLeadsButton } from "@/components/admin/ProvisionPendingLeadsButton";
import {
  ClientesWorkspace,
  type ClientRow,
} from "@/components/admin/ClientesWorkspace";

export const metadata: Metadata = { title: "Clientes — Admin" };

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const host = (await headers()).get("host");
  const token = await getServerAccessToken();
  let clients: ClientRow[] = [];
  let loadError: string | null = null;

  if (!token) {
    loadError = "Iniciá sesión para ver los leads.";
  } else {
    try {
      const leads = await adminApi.leads(token);
      clients = leads.map(leadToRow);
    } catch (err) {
      loadError =
        err instanceof Error
          ? err.message
          : "No pudimos cargar los leads desde la API.";
    }
  }

  const kpis = deriveKpis(clients);
  const pendingCount = clients.filter(
    (c) =>
      !c.organizationId &&
      c.rawStatus !== "converted" &&
      c.rawStatus !== "rejected" &&
      c.rawStatus !== "closed" &&
      c.rawStatus !== "lost",
  ).length;

  return (
    <>
      <div className="page-title-row">
        <div>
          <h1>Clientes</h1>
          <p>Leads de /comenzar y cuentas convertidas</p>
        </div>
        <ProvisionPendingLeadsButton pendingCount={pendingCount} />
      </div>

      {loadError && <p className="login-error">{loadError}</p>}

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
            <div className={`delta${k.tone === "warning" ? " warn" : ""}`}>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <ClientesWorkspace
        clients={clients}
        organizacionesHref={adminHref("/organizaciones", { host })}
      />
    </>
  );
}

function leadToRow(lead: AdminLead): ClientRow {
  return {
    id: lead.id,
    name: lead.business || lead.orgName || lead.email,
    plan: lead.plan || "—",
    status: humanStatus(lead.status),
    rawStatus: lead.status,
    contact: lead.email,
    location: lead.categoria || undefined,
    organizationId: lead.organizationId,
    createdAt: lead.createdAt,
  };
}

function humanStatus(status: string): string {
  switch (status) {
    case "new":
      return "Lead";
    case "contacted":
    case "in_progress":
      return "En seguimiento";
    case "converted":
      return "Convertido";
    case "rejected":
      return "Rechazado";
    case "lost":
    case "closed":
      return "Cerrado";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function deriveKpis(clients: ClientRow[]) {
  const leads = clients.filter((c) => c.rawStatus === "new").length;
  const converted = clients.filter((c) => c.rawStatus === "converted").length;
  const rejected = clients.filter((c) => c.rawStatus === "rejected").length;
  const other = clients.length - leads - converted - rejected;
  return [
    {
      label: "Leads nuevos",
      value: leads,
      delta: "Pendientes de org",
      tone: "warning" as const,
    },
    {
      label: "Convertidos",
      value: converted,
      delta: "Con organización",
      tone: "positive" as const,
    },
    {
      label: "Rechazados",
      value: rejected,
      delta: "Solicitudes rechazadas",
      tone: "muted" as const,
    },
    {
      label: "Otros",
      value: other,
      delta: "Seguimiento / otros",
      tone: "muted" as const,
    },
  ];
}
