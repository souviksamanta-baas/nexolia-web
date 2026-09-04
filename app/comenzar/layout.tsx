import type { Metadata } from "next";
import { MktHeader } from "@/components/MktHeader";
import { MktFooter } from "@/components/MktFooter";

export const metadata: Metadata = {
  title: "Comenzar con Nexolia",
  description:
    "Contanos sobre tu negocio y activá tu cuenta Nexolia en 3 pasos: información, servicios y plan.",
};

export default function ComenzarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="onboard-body">
      <MktHeader />
      <main className="onboard-main">{children}</main>
      <MktFooter />
    </div>
  );
}
