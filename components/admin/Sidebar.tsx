"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  /** Match string appended to /admin/pronto?m= for stub links. */
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
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Clientes", href: "/admin/clientes" },
      { label: "Organizaciones y usuarios", href: "/admin/organizaciones" },
      { label: "Planes y suscripciones", href: "/admin/planes" },
    ],
  },
  {
    label: "Comunicaciones",
    items: [
      { label: "WhatsApp", href: "/admin/pronto?m=WhatsApp", moduleKey: "WhatsApp" },
      { label: "Instagram", href: "/admin/pronto?m=Instagram", moduleKey: "Instagram" },
      { label: "Inbox", href: "/admin/pronto?m=Inbox", moduleKey: "Inbox" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Ventas", href: "/admin/pronto?m=Ventas", moduleKey: "Ventas" },
      { label: "Facturas", href: "/admin/pronto?m=Facturas", moduleKey: "Facturas" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Integraciones", href: "/admin/pronto?m=Integraciones", moduleKey: "Integraciones" },
      { label: "Roles y permisos", href: "/admin/roles" },
      { label: "Auditoría", href: "/admin/auditoria" },
      { label: "Notificaciones", href: "/admin/pronto?m=Notificaciones", moduleKey: "Notificaciones" },
      { label: "Salud", href: "/admin/pronto?m=Salud", moduleKey: "Salud" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const activeModule = search.get("m");

  const isActive = (item: NavItem) => {
    const [path] = item.href.split("?");
    if (!pathname) return false;
    if (item.moduleKey) {
      return pathname.startsWith("/admin/pronto") && activeModule === item.moduleKey;
    }
    if (path === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
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
                href={item.href}
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
