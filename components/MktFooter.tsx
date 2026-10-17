import Link from "next/link";

export function MktFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sitio-footer">
      <div className="sitio-wrap footer-grid">
        <div className="footer-brand">
          <img
            className="logo"
            src="/nexolia-logo-footer.png"
            alt="Nexolia"
          />
          <p>
            Tu negocio, <span className="accent">más inteligente.</span>
          </p>
        </div>
        <div className="footer-col">
          <h4>Producto</h4>
          <ul>
            <li>
              <Link href="/#producto">Producto</Link>
            </li>
            <li>
              <Link href="/copi">Copi</Link>
            </li>
            <li>
              <Link href="/suscripciones">Suscripciones</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Ayuda</h4>
          <ul>
            <li>
              <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
            </li>
            <li>
              <Link href="/contacto">Contacto</Link>
            </li>
            <li>
              <Link href="/guia">Guía</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li>
              <Link href="/privacidad">Privacidad</Link>
            </li>
            <li>
              <Link href="/eliminacion-de-cuenta">Eliminación de cuenta</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="sitio-wrap footer-bottom">
        <p className="footer-copy">© {year} Nexolia.</p>
        <div className="footer-bottom-actions">
          <div className="footer-contact-icons">
            <a
              className="footer-contact-link"
              href="mailto:hola@nexolia.com.ar"
            >
              <span className="footer-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M4.5 7.5 12 13l7.5-5.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>hola@nexolia.com.ar</span>
            </a>
            <a
              className="footer-contact-link"
              href="https://wa.me/543546517096"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="footer-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.04 2.5c-5.23 0-9.48 4.2-9.48 9.37 0 1.65.44 3.26 1.27 4.68L2.5 21.5l5.12-1.33a9.5 9.5 0 0 0 4.42 1.07h.01c5.23 0 9.48-4.2 9.48-9.37S17.27 2.5 12.04 2.5zm5.54 13.3c-.23.65-1.35 1.2-1.87 1.28-.48.07-1.09.1-1.76-.11-.4-.13-.92-.3-1.58-.59-2.78-1.2-4.58-3.98-4.72-4.16-.14-.18-1.14-1.51-1.14-2.88 0-1.37.72-2.04.97-2.32.26-.28.56-.35.75-.35h.54c.17 0 .4-.06.63.48.23.55.78 1.9.85 2.04.07.14.11.3.02.49-.09.18-.13.3-.26.46-.13.16-.28.36-.4.48-.13.13-.26.27-.11.53.14.26.64 1.05 1.37 1.7.94.84 1.73 1.1 1.97 1.22.24.13.39.11.53-.06.14-.18.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.17 1.23z" />
                </svg>
              </span>
              <span>03546 - 51 - 7096</span>
            </a>
          </div>
          <div
            className="footer-social-icons"
            aria-label="Redes sociales (próximamente)"
          >
            <span
              className="footer-icon is-disabled"
              aria-disabled="true"
              title="Instagram"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
            </span>
            <span
              className="footer-icon is-disabled"
              aria-disabled="true"
              title="YouTube"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12.2c0-2.2-.2-3.7-.5-4.5-.3-.8-.9-1.4-1.7-1.7C18.3 5.5 12 5.5 12 5.5s-6.3 0-7.8.5c-.8.3-1.4.9-1.7 1.7C2.2 8.5 2 10 2 12.2s.2 3.7.5 4.5c.3.8.9 1.4 1.7 1.7 1.5.5 7.8.5 7.8.5s6.3 0 7.8-.5c.8-.3 1.4-.9 1.7-1.7.3-.8.5-2.3.5-4.5zM10 15.2V9.2l5.2 3-5.2 3z" />
              </svg>
            </span>
            <span
              className="footer-icon is-disabled"
              aria-disabled="true"
              title="X"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.9 2.5h3.2l-7 8 8.2 11H16.7l-5.1-6.7L5.8 21.5H2.6l7.5-8.6L2.1 2.5h6.7l4.6 6.1 5.5-6.1zm-1.1 17h1.8L6.4 4.4H4.5l13.3 15.1z" />
              </svg>
            </span>
            <span
              className="footer-icon is-disabled footer-icon-threads"
              aria-disabled="true"
              title="Threads"
              aria-label="Threads"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15.8 8.2c-.2-2-1.6-3.3-3.7-3.3-2.3 0-3.9 1.5-3.9 3.8 0 4.2 6.5 3.1 6.5 6.9 0 1.8-1.5 3.2-3.6 3.2-1.9 0-3.3-1-3.8-2.6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9.2 12.2h5.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
