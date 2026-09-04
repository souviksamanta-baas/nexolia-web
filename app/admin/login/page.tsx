import type { Metadata } from "next";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";

export const metadata: Metadata = {
  title: "Iniciar sesión — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="login-page">
      <AdminLoginCard />
    </div>
  );
}
