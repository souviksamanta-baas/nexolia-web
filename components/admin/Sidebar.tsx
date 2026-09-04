"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { adminHref, normalizeAdminPathname } from "@/lib/admin-paths";

interface NavItem {
  label: string;
  /** Clean path without `/admin` prefix. */
  href: string;
  moduleKey?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: "Gestión",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Clientes", href: "/clientes" },
      { label: "Organizaciones y usuarios", href: "/organizaciones" },
      { label: "Planes y suscripciones", href: "/planes" },
    ],
  },
  {
    label: "Comunicaciones",
    items: [
      { label: "WhatsApp", href: "/pronto?m=WhatsApp", moduleKey: "WhatsApp" },
      { label: "Instagram", href: "/pronto?m=Instagram", moduleKey: "Instagram" },
      { label: "Inbox", href: "/pronto?m=Inbox", moduleKey: "Inbox" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Ventas", href: "/pronto?m=Ventas", moduleKey: "Ventas" },
      { label: "Facturas", href: "/pronto?m=Facturas", moduleKey: "Facturas" },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Integraciones",
        href: "/pronto?m=Integraciones",
        moduleKey: "Integraciones",
      },
      { label: "Roles y permisos", href: "/roles" },
      { label: "Auditoría", href: "/auditoria" },
      {
        label: "Notificaciones",
        href: "/pronto?m=Notificaciones",
        moduleKey: "Notificaciones",
      },
      { label: "Salud", href: "/pronto?m=Salud", moduleKey: "Salud" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const activeModule = search.get("m");
  const current = normalizeAdminPathname(pathname || "/");

  const isActive = (item: NavItem) => {
    const [path] = item.href.split("?");
    if (item.moduleKey) {
      return current.startsWith("/pronto") && activeModule === item.moduleKey;
    }
    if (path === "/dashboard") {
      return current === "/dashboard" || current === "/";
    }
    return current === path || current.startsWith(`${path}/`);
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">nexolia</span>
        <span className="brand-sub">Admin Portal</span>
      </div>
      <nav className="sidebar-nav">
        {GROUPS.map((group) => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.label}
                className={`nav-link${isActive(item) ? " is-active" : ""}`}
                href={adminHref(item.href)}
              >
                <span className="dot" /> {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
