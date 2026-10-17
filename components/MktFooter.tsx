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
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.743 11.123a8.547 8.547 0 0 0-.315-.142c-.185-3.414-2.05-5.368-5.182-5.388h-.042c-1.874 0-3.431.8-4.39 2.255l1.722 1.181c.716-1.087 1.84-1.319 2.669-1.319h.028c1.031.007 1.81.307 2.313.892.367.425.612 1.014.733 1.756a13.176 13.176 0 0 0-2.96-.143c-2.977.172-4.892 1.908-4.763 4.321.065 1.224.675 2.277 1.717 2.965.88.582 2.015.866 3.195.802 1.557-.086 2.778-.68 3.63-1.766.648-.825 1.057-1.894 1.238-3.241.742.448 1.292 1.037 1.596 1.745.517 1.205.547 3.184-1.068 4.797-1.415 1.414-3.116 2.025-5.686 2.044-2.851-.02-5.008-.935-6.41-2.717-1.313-1.67-1.991-4.08-2.016-7.165.025-3.085.703-5.496 2.016-7.165 1.402-1.782 3.558-2.696 6.41-2.717 2.871.02 5.065.94 6.521 2.73.714.879 1.252 1.983 1.607 3.27l2.018-.538c-.43-1.585-1.107-2.95-2.027-4.083C18.43 1.2 15.7.024 12.185 0h-.014C8.66.024 5.963 1.205 4.15 3.51c-1.614 2.05-2.446 4.905-2.474 8.482v.016c.028 3.578.86 6.431 2.473 8.482 1.813 2.305 4.512 3.486 8.022 3.51h.014c3.12-.022 5.319-.839 7.13-2.649 2.371-2.368 2.3-5.336 1.518-7.158-.56-1.307-1.629-2.368-3.09-3.07zm-5.387 5.065c-1.305.074-2.66-.512-2.728-1.766-.05-.93.662-1.969 2.808-2.092.246-.015.487-.021.724-.021.78 0 1.508.075 2.171.22-.247 3.088-1.697 3.59-2.975 3.66z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
