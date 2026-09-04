import Link from "next/link";

export default function HomePage() {
  return (
    <div className="site-layout">
      <header className="site-header">
        <img src="/nexolia-logo.svg" alt="Nexolia" width={220} height={49} />
      </header>

      <main className="site-main coming-soon">
        <span className="badge">Próximamente</span>
        <h1>Estamos preparando algo nuevo</h1>
        <p className="tagline">Tu negocio, más inteligente</p>
        <p className="description">
          Nexolia es el asistente inteligente para dueños de negocios: unifica
          tu bandeja de WhatsApp, CRM e inventario en una sola app.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/comenzar">
            Comenzar
          </Link>
          <a
            className="btn btn-secondary"
            href="mailto:hola@nexolia.com.ar"
          >
            Hablar con nosotros
          </a>
        </div>
      </main>

      <footer className="site-footer">
        <Link href="/privacidad">Política de privacidad</Link>
        {" · "}
        <Link href="/eliminacion-de-cuenta">Eliminación de cuenta</Link>
        {" · "}
        <a href="mailto:privacidad@nexolia.com.ar">privacidad@nexolia.com.ar</a>
      </footer>
    </div>
  );
}
