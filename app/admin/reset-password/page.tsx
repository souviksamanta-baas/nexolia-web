import type { Metadata } from "next";
import { AdminResetPasswordCard } from "@/components/admin/AdminResetPasswordCard";

export const metadata: Metadata = {
  title: "Nueva contraseña — Admin",
  robots: { index: false, follow: false },
};

export default function AdminResetPasswordPage() {
  return (
    <div className="login-page">
      <AdminResetPasswordCard />
    </div>
  );
}
