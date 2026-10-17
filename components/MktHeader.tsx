"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

type NavKey = "producto" | "copi" | "suscripciones" | "contacto";

const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: "producto", href: "/#producto", label: "Producto" },
  { key: "copi", href: "/copi", label: "Copi" },
  { key: "suscripciones", href: "/suscripciones", label: "Suscripciones" },
  { key: "contacto", href: "/contacto", label: "Contacto" },
];

const MOBILE_MQ = "(max-width: 960px)";

export function MktHeader({ active }: { active?: NavKey }) {
  const navId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      if (!mq.matches) setOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("is-menu-open");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("is-menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-menu-open");
    };
  }, [open]);

  return (
    <header className={`sitio-header${open ? " is-menu-open" : ""}`}>
      <Link className="brand" href="/">
        <img className="logo" src="/nexolia-logo.png" alt="Nexolia" />
      </Link>
      <nav className="sitio-nav" id={navId} aria-label="Principal">
        {NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={active === item.key ? "is-active" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sitio-actions">
        <button
          className="btn btn-ghost btn-sm sitio-login"
          type="button"
          disabled
          aria-disabled="true"
        >
          Ingresar
        </button>
        <Link
          className="btn btn-primary btn-sm"
          href="/comenzar"
          onClick={() => setOpen(false)}
        >
          Comenzar
        </Link>
      </div>
      <button
        type="button"
        className="sitio-menu-toggle"
        aria-expanded={open}
        aria-controls={navId}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => {
          if (typeof window !== "undefined" && !window.matchMedia(MOBILE_MQ).matches) {
            return;
          }
          setOpen((v) => !v);
        }}
      >
        <span className="sitio-menu-toggle-bars" aria-hidden="true" />
      </button>
    </header>
  );
}
