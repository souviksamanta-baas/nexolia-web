# Mockups Nexolia — checklist de QA

Marcá cada ítem al revisar. No está marcado por defecto.

## Tokens y marca

- [ ] Navy `#101935`, primary `#08bd66` / `#04a85a` — sin púrpura
- [ ] Fondo `#fbfcfb`, surface blanco, bordes `#e4ebef`
- [ ] Textos secondary/muted correctos
- [ ] Logo `../public/nexolia-logo.svg` visible en login y onboarding
- [ ] Copy en español (es-AR); montos con punto de miles (`$29.000`)

## Galería y navegación

- [ ] `mockups/index.html` enlaza todas las pantallas
- [ ] Click-through admin: login → dashboard → clientes / orgs / planes / pronto
- [ ] FAB Grok lleva a `dashboard-grok.html`
- [ ] Onboarding: paso 1 → 2 → 3 → gracias
- [ ] Links “Pronto” de sidebar/nav llegan a stub

## Shell admin (excepto login)

- [ ] Sidebar navy “nexolia ADMIN PORTAL”
- [ ] Grupos: GESTIÓN / COMUNICACIONES / OPERACIONES / SISTEMA
- [ ] Header: Buscar… ⌘K, campana con badge, chip Super Admin
- [ ] FAB verde “Asistente Grok” (no púrpura)
- [ ] Mobile: hamburger abre drawer; overlay cierra

## Dashboard

- [ ] KPIs v1: Clientes activos, En prueba, Pagos por confirmar, Licencias por vencer
- [ ] Sin KPIs de ventas / facturas fallidas
- [ ] Placeholder chart de pagos confirmados
- [ ] Tabla clientes recientes + actividad (leads/pagos, no conversaciones)

## Dashboard + Grok

- [ ] Panel Grok abierto
- [ ] Chips v1: Leads pendientes, Pagos por confirmar, Orgs sin owner, Licencias por vencer
- [ ] Sin chip “facturas fallidas”

## Clientes / Orgs / Planes

- [ ] Clientes: lista + panel derecho de detalle
- [ ] Orgs: tabs Orgs | Usuarios, lista + detalle
- [ ] Planes: Starter `$29.000` / Básico `$69.000` / Pro `$149.000`
- [ ] Tabla de suscripciones debajo

## Onboarding

- [ ] Chrome marketing: logo, Producto/Planes/Ayuda, Iniciar sesión, Comenzar
- [ ] Paso 1: email + dropdown categorías (Ferretería, Dietética, Clínica, Veterinaria, Restaurante, Taller, Servicios profesionales)
- [ ] Paso 2: cards = feature flags de la app (`commerce_*`, `billing_*`, `appointments`, Copi, canales, `multi_sucursales`); value = key exacta
- [ ] Paso 3: toggle Mensual/Anual + 3 planes
- [ ] Gracias: pedido recibido + copy transferencia/efectivo

## Técnico

- [ ] Sin frameworks (HTML/CSS/JS mínimo)
- [ ] Responsive desktop + mobile
- [ ] `npm run mockups` sirve `/mockups/`
- [ ] Roles y Auditoría tienen pantallas propias (no stub)
- [ ] Shared `shell.js` / `onboard.js` para drawer y toggles
