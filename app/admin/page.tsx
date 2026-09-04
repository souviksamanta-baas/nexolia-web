import { redirect } from "next/navigation";

// Bare /admin lands on the dashboard when authenticated; the portal layout
// enforces auth and will bounce to /admin/login if needed.
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
