import Link from "next/link";

export function MktHeader() {
  return (
    <header className="mkt-header">
      <Link href="/">
        <img className="logo" src="/nexolia-logo.svg" alt="Nexolia" />
      </Link>
      <nav className="mkt-nav" aria-label="Principal">
        <Link href="/">Producto</Link>
        <Link href="/comenzar?step=3">Planes</Link>
        <a href="mailto:hola@nexolia.com.ar">Ayuda</a>
      </nav>
      <div className="mkt-actions">
        <a
          className="btn btn-ghost btn-sm"
          href={process.env.NEXT_PUBLIC_ADMIN_URL || "/admin/login"}
        >
          Iniciar sesión
        </a>
        <Link className="btn btn-primary btn-sm" href="/comenzar">
          Comenzar
        </Link>
      </div>
    </header>
  );
}
