import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { adminHref } from "@/lib/admin-paths";

// Bare /admin (or / on admin host) lands on the dashboard when authenticated.
export default async function AdminIndex() {
  const host = (await headers()).get("host");
  redirect(adminHref("/dashboard", { host }));
}
