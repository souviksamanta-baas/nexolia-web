export type NexoliaStaffRole = "super_admin" | "admin";

export function friendlyRole(role: string): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    default:
      return "Staff";
  }
}

export function isStaffRole(role: string): role is NexoliaStaffRole {
  return role === "super_admin" || role === "admin";
}
