import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eliminación de cuenta y datos",
  description:
    "Cómo solicitar la eliminación de tu cuenta Nexolia Owner y de los datos asociados (Play Store / App Store).",
  alternates: { canonical: "/eliminacion-de-cuenta" },
};

export default function EliminacionDeCuentaPage() {
  return (
    <div className="site-layout policy-page">
      <header className="site-header">
        <Link href="/">
          <img src="/nexolia-logo.svg" alt="Nexolia" width={180} height={40} />
        </Link>
      </header>

      <main className="site-main">
        <Link className="back-link" href="/">
          ← Volver al inicio
        </Link>

        <h1>Eliminación de cuenta y datos</h1>
        <p className="updated">
          <strong>Última actualización:</strong> 26 de julio de 2026
        </p>
        <p>
          Esta página explica cómo eliminar tu cuenta de la aplicación móvil{" "}
          <strong>Nexolia Owner</strong> y los datos asociados. Es la URL pública para Google Play
          y App Store.
        </p>

        <h2>1. Cómo eliminar tu cuenta desde la app</h2>
        <ol>
          <li>
            Abrí <strong>Mi cuenta → Privacidad y datos</strong>.
          </li>
          <li>
            Escribí <code>ELIMINAR</code> en el campo de confirmación.
          </li>
          <li>
            Tocá <strong>Eliminar mi cuenta</strong>.
          </li>
        </ol>
        <p>Eso:</p>
        <ul>
          <li>elimina tu usuario de autenticación;</li>
          <li>
            elimina los negocios de los que sos <strong>único dueño</strong> (incluye datos del
            negocio asociados);
          </li>
          <li>
            si compartís un negocio con otros dueños, primero debés{" "}
            <strong>transferir la propiedad</strong>.
          </li>
        </ul>

        <h2>2. Cómo eliminar o archivar un negocio (sin borrar la cuenta)</h2>
        <p>
          En <strong>Privacidad y datos</strong> (solo dueño):
        </p>
        <ul>
          <li>
            <strong>Archivar negocio</strong> (confirmá <code>ARCHIVAR</code>): el negocio deja de
            aparecer; se desconectan canales.
          </li>
          <li>
            <strong>Eliminar negocio</strong> (confirmá <code>ELIMINAR</code>): borra el negocio y
            datos asociados (centros, miembros, inbox, inventario, etc.).
          </li>
        </ul>
        <p>
          Los miembros del equipo pueden <strong>Salir del negocio</strong> sin borrar su cuenta.
        </p>

        <h2>3. Exportación de datos</h2>
        <p>
          Los dueños pueden <strong>Exportar datos del negocio</strong> desde Privacidad y datos
          (JSON con org, miembros, contactos, conversaciones y productos).
        </p>

        <h2>4. Solicitud por correo (si no podés entrar a la app)</h2>
        <p>
          Escribí a{" "}
          <a href="mailto:privacidad@nexolia.com.ar">privacidad@nexolia.com.ar</a> con:
        </p>
        <ul>
          <li>email o teléfono de la cuenta;</li>
          <li>nombre del negocio;</li>
          <li>pedido explícito de borrado de cuenta y datos asociados.</li>
        </ul>
        <p>Procesamos la baja en un plazo razonable (objetivo ≤ 30 días).</p>

        <h2>5. Qué se borra / qué puede quedar</h2>
        <ul>
          <li>
            <strong>Se borra:</strong> membresías, organización (si aplica), conversaciones,
            productos/stock del tenant, tokens push, configuración de WhatsApp/Instagram del tenant.
          </li>
          <li>
            <strong>Puede quedar temporalmente:</strong> backups operativos, logs de
            infraestructura y registros legales mínimos, hasta la rotación habitual.
          </li>
        </ul>

        <h2>6. URL canónica (Play Console)</h2>
        <p>
          <code>https://nexolia.com.ar/eliminacion-de-cuenta</code>
        </p>
        <p>
          También disponible como{" "}
          <Link href="/account-deletion">
            <code>https://nexolia.com.ar/account-deletion</code>
          </Link>
          .
        </p>

        <h2>7. Contacto</h2>
        <p>
          <strong>Nexolia — Privacidad</strong>
          <br />
          Correo: <a href="mailto:privacidad@nexolia.com.ar">privacidad@nexolia.com.ar</a>
          <br />
          Política de privacidad:{" "}
          <Link href="/privacidad">https://nexolia.com.ar/privacidad</Link>
          <br />
          Sitio: <a href="https://nexolia.com.ar">https://nexolia.com.ar</a>
        </p>
      </main>

      <footer className="site-footer">
        <Link href="/">Inicio</Link>
        {" · "}
        <Link href="/privacidad">Política de privacidad</Link>
        {" · "}
        <a href="mailto:privacidad@nexolia.com.ar">privacidad@nexolia.com.ar</a>
      </footer>
    </div>
  );
}
