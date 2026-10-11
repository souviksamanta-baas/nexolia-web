import type { AdminOrganization } from "@/lib/api";

export type OrgLifecycleState =
  | "active"
  | "trial"
  | "pending_payment"
  | "paused"
  | "expired"
  | "archived"
  | "deleted"
  | "other";

export function resolveOrgLifecycleState(
  org: Pick<AdminOrganization, "status" | "archivedAt" | "deletedAt">,
): OrgLifecycleState {
  if (org.deletedAt || org.status === "deleted") return "deleted";
  if (org.archivedAt) return "archived";
  if (org.status === "active") return "active";
  if (org.status === "trial") return "trial";
  if (org.status === "pending_payment") return "pending_payment";
  if (org.status === "paused" || org.status === "suspended") return "paused";
  if (org.status === "expired") return "expired";
  return "other";
}

export function orgLifecycleLabel(state: OrgLifecycleState): string {
  switch (state) {
    case "active":
      return "Activa";
    case "trial":
      return "Prueba";
    case "pending_payment":
      return "Pendiente de pago";
    case "paused":
      return "Pausada";
    case "expired":
      return "Vencida";
    case "archived":
      return "Archivada";
    case "deleted":
      return "Eliminada";
    default:
      return "Otro";
  }
}

export function orgLifecycleBadgeClass(state: OrgLifecycleState): string {
  switch (state) {
    case "active":
      return "badge badge-green";
    case "trial":
    case "pending_payment":
      return "badge badge-warn";
    case "paused":
    case "expired":
    case "deleted":
      return "badge badge-danger";
    case "archived":
      return "badge badge-muted";
    default:
      return "badge badge-muted";
  }
}

/** CSS class for table row tint. */
export function orgLifecycleRowClass(state: OrgLifecycleState): string {
  return `org-row org-row--${state}`;
}
