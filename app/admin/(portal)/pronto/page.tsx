import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ m?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { m } = await searchParams;
  return { title: `${m || "Módulo"} — Admin` };
}

export default async function ProntoPage({ searchParams }: Props) {
  const { m } = await searchParams;
  const mod = m || "Comunicaciones";

  return (
    <div className="stub-page">
      <div className="icon-circle">⏱</div>
      <h1>{mod} — pronto</h1>
      <p className="secondary">
        Este módulo estará disponible pronto. Mientras tanto podés gestionar
        clientes, organizaciones y planes desde el menú de Gestión.
      </p>
      <Link className="btn btn-primary" href="/admin/dashboard" style={{ marginTop: "1rem" }}>
        Volver al dashboard
      </Link>
    </div>
  );
}
