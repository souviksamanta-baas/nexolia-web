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

export function MktHeader({ active }: { active?: NavKey }) {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`sitio-header${open ? " is-menu-open" : ""}`}>
      <Link className="brand" href="/">
        <img className="logo" src="/nexolia-logo.png" alt="Nexolia" />
      </Link>
      <button
        type="button"
        className="sitio-menu-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sitio-menu-toggle-bars" aria-hidden="true" />
      </button>
      <div className="sitio-menu" id={menuId}>
        <nav className="sitio-nav" aria-label="Principal">
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
      </div>
    </header>
  );
}
