import type { Metadata } from "next";
import Link from "next/link";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export const metadata: Metadata = {
  title: "Guía de la app Owner",
  description:
    "Cómo registrar tu negocio o unirte con QR, y recorrer todas las funciones de Nexolia Owner: chats, Copi, inventario, compras, ventas, tareas y más.",
  alternates: { canonical: "/guia" },
};

type StepRow = {
  id: string;
  what: string;
  steps: string;
  expect: string;
};

function GuideTable({
  headers,
  rows,
}: {
  headers: [string, string, string, string];
  rows: StepRow[];
}) {
  const [, whatLabel, stepsLabel, expectLabel] = headers;
  return (
    <div className="guide-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="#">{row.id}</td>
              <td data-label={whatLabel}>{row.what}</td>
              <td data-label={stepsLabel}>{row.steps}</td>
              <td data-label={expectLabel}>{row.expect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HEADERS: [string, string, string, string] = [
  "#",
  "Qué probar",
  "Pasos",
  "Resultado esperado",
];

export default function GuiaPage() {
  return (
    <div className="site-layout policy-page guide-page">
      <header className="site-header">
        <Link href="/">
          <img src="/nexolia-logo.svg" alt="Nexolia" width={180} height={40} />
        </Link>
      </header>

      <main className="site-main">
        <Link className="back-link" href="/">
          ← Volver al inicio
        </Link>

        <h1>Guía de la app Nexolia Owner</h1>
        <p>
          Esta página reúne cómo <strong>empezar</strong> (negocio nuevo o unirte a uno
          existente) y un recorrido completo de <strong>funciones y flujos</strong> para
          probar la app con tranquilidad. Marcá lo que pruebes y anotá cualquier
          diferencia entre lo esperado y lo que viste.
        </p>

        <nav className="guide-toc" aria-label="Contenido">
          <p className="guide-toc-title">Contenido</p>
          <ol>
            <li>
              <a href="#empezar">Cómo empezar</a>
              <ol>
                <li>
                  <a href="#negocio-nuevo">Registrar un negocio por primera vez</a>
                </li>
                <li>
                  <a href="#unirse-qr">Unirse a un negocio existente (QR)</a>
                </li>
              </ol>
            </li>
            <li>
              <a href="#acceso">Acceso y cuenta</a>
            </li>
            <li>
              <a href="#inicio">Inicio</a>
            </li>
            <li>
              <a href="#chats">Chats</a>
            </li>
            <li>
              <a href="#copi">Copi</a>
            </li>
            <li>
              <a href="#ventas">Ventas ($)</a>
            </li>
            <li>
              <a href="#inventario">Inventario y productos</a>
            </li>
            <li>
              <a href="#compras">Compras y proveedores</a>
            </li>
            <li>
              <a href="#tareas">Tareas y notificaciones</a>
            </li>
            <li>
              <a href="#caja">Caja y reportes</a>
            </li>
            <li>
              <a href="#sucursales">Multisucursal</a>
            </li>
            <li>
              <a href="#integraciones">Integraciones y soporte</a>
            </li>
            <li>
              <a href="#recorrido">Recorrido sugerido</a>
            </li>
            <li>
              <a href="#reportar">Cómo reportar un problema</a>
            </li>
          </ol>
        </nav>

        <h2 id="empezar">1. Cómo empezar</h2>
        <p>
          Hay dos caminos. Elegí el que corresponda <strong>antes</strong> de usar el resto
          de la app:
        </p>
        <ul>
          <li>
            <strong>Sos dueño y todavía no tenés negocio en Nexolia</strong> → registralo en
            la web (<a href="#negocio-nuevo">sección 1.1</a>).
          </li>
          <li>
            <strong>Te invitaron a un negocio que ya existe</strong> → pedile el QR al dueño
            y uníte desde la app (<a href="#unirse-qr">sección 1.2</a>).
          </li>
        </ul>
        <p>
          En la app <strong>no se crea el negocio</strong>: el alta del comercio es en{" "}
          <Link href="/comenzar">nexolia.com.ar/comenzar</Link>. La app sirve para ingresar
          cuando ya estás registrado o cuando tenés una invitación.
        </p>

        <h3 id="negocio-nuevo">1.1 Registrar un negocio por primera vez (dueño)</h3>
        <p>
          <strong>Cuándo:</strong> sos el dueño o responsable del comercio y todavía no
          existe una organización Nexolia para ese negocio.
        </p>
        <ol>
          <li>
            Abrí <Link href="/comenzar">https://nexolia.com.ar/comenzar</Link> desde el
            navegador del celular o la computadora (también desde la app:{" "}
            <em>Bienvenido → Quiero registrar mi negocio</em>).
          </li>
          <li>
            Completá el asistente: datos del negocio, categoría, plan y módulos que
            necesitás, y tus datos de contacto (usá el <strong>mismo correo</strong> con el
            que vas a iniciar sesión en la app).
          </li>
          <li>
            Enviá la solicitud. El equipo de Nexolia revisa y confirma el alta (no es
            inmediato en todos los casos).
          </li>
          <li>
            Cuando te confirmen, descargá o abrí la app <strong>Nexolia Owner</strong> e{" "}
            <strong>iniciá sesión con ese mismo email</strong> (código OTP por correo).
          </li>
          <li>
            Deberías entrar al panel de tu negocio (Inicio). Si aún no está confirmado, la
            app te indica esperar o completar el alta en la web.
          </li>
        </ol>
        <p>
          Después del primer ingreso podés conectar WhatsApp, cargar productos, invitar
          equipo y seguir el recorrido de más abajo.
        </p>

        <h3 id="unirse-qr">1.2 Unirse a un negocio existente (invitación QR)</h3>
        <p>
          <strong>Cuándo:</strong> el negocio ya está en Nexolia y el dueño (o co-dueño)
          quiere darte acceso como empleado, administrador o co-dueño.{" "}
          <strong>No uses /comenzar</strong> para esto: pedí una invitación.
        </p>

        <h4>Qué hace el dueño (generar el QR)</h4>
        <ol>
          <li>
            En la app, con sesión del dueño: <strong>Mi cuenta → Invitar miembro (QR)</strong>{" "}
            (también desde Más).
          </li>
          <li>
            Completá el <strong>nombre</strong> de la persona, el <strong>teléfono</strong>{" "}
            con el que va a verificar la invitación, y el <strong>rol</strong> (Empleado,
            Administrador o Co-dueño, según permisos).
          </li>
          <li>
            Tocá <strong>Generar QR</strong> y mostrale o compartile el código a la persona
            (puede escanearlo desde tu pantalla).
          </li>
        </ol>

        <h4>Qué hace quien se une (escanear el QR)</h4>
        <ol>
          <li>
            Pedile al dueño el QR de invitación (no alcanza con “crear otro negocio” en la
            web).
          </li>
          <li>
            Abrí la app Nexolia Owner. En la pantalla de bienvenida tocá{" "}
            <strong>Unirme con invitación (QR)</strong>.
          </li>
          <li>
            Permití el uso de la cámara y apuntá al QR. Si el código no es de Nexolia, la
            app lo indica.
          </li>
          <li>
            Verificá tu identidad con el <strong>mismo teléfono</strong> que cargó el dueño
            en la invitación (OTP por SMS u opción disponible). Si ya tenías sesión con
            otro método, la app te guía a verificar ese número.
          </li>
          <li>
            Al aceptar, quedás vinculado al negocio y entrás al panel con el rol asignado.
          </li>
        </ol>
        <p>
          Si ya tenés cuenta pero aún no estás en ningún negocio, también podés escanear
          el QR desde la pantalla de bienvenida o desde onboarding.
        </p>

        <h2 id="acceso">2. Acceso y cuenta</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "2.1",
              what: "Login por correo",
              steps: "Abrí la app → pedí código → ingresá el OTP del mail",
              expect: "Entrá al negocio sin errores en español",
            },
            {
              id: "2.2",
              what: "Reenviar código",
              steps: "En verificación → Reenviar código",
              expect: "Llega un código nuevo; el anterior deja de servir",
            },
            {
              id: "2.3",
              what: "Sesión al reabrir",
              steps: "Cerrá la app por completo y volvé a abrirla",
              expect: "Entrá directo (sin quedarte en “Comprobando sesión”)",
            },
            {
              id: "2.4",
              what: "Sin negocio",
              steps: "Usuario nuevo o sin organización",
              expect: "Pantalla de bienvenida clara (registrar en web o unirse con QR)",
            },
            {
              id: "2.5",
              what: "Cerrar sesión",
              steps: "Mi cuenta → cerrar sesión",
              expect: "Volvés al login; no volvés “atrás” al panel",
            },
            {
              id: "2.6",
              what: "Editar perfil",
              steps: "Avatar / Mi cuenta → Editar perfil",
              expect: "Nombre, teléfono; email de solo lectura",
            },
            {
              id: "2.7",
              what: "Foto de perfil",
              steps: "Lápiz en el avatar → cámara o galería",
              expect: "Se ve en header y en Mi cuenta",
            },
            {
              id: "2.8",
              what: "Invitar miembro",
              steps: "Mi cuenta → Invitar miembro (QR)",
              expect: "Se genera QR; el invitado puede unirse (ver §1.2)",
            },
            {
              id: "2.9",
              what: "Cambiar de negocio",
              steps: "Si tenés más de uno → Negocios",
              expect: "Dashboard e inventario corresponden al elegido",
            },
            {
              id: "2.10",
              what: "Configuración del negocio",
              steps: "Dueño → Configuración del negocio",
              expect: "Nombre, mail, dirección, zona horaria; miembros",
            },
          ]}
        />

        <h2 id="inicio">3. Inicio (Home)</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "3.1",
              what: "Saludo",
              steps: "Abrí Inicio",
              expect: "Te saluda por nombre preferido o nombre",
            },
            {
              id: "3.2",
              what: "Métricas del día",
              steps: "Revisá resumen (mensajes, ventas, stock bajo, etc.)",
              expect: "Números coherentes con tu actividad",
            },
            {
              id: "3.3",
              what: "Stock bajo",
              steps: "Tocá la métrica / alerta de stock bajo",
              expect: "Abre Gestionar stock filtrado a bajos",
            },
            {
              id: "3.4",
              what: "Alertas recientes",
              steps: "Tocá una alerta de tarea o stock",
              expect: "Va al detalle correcto y podés volver",
            },
            {
              id: "3.5",
              what: "WhatsApp no conectado",
              steps: "Si no está conectado",
              expect: "Banner de conexión; te lleva a conectar",
            },
            {
              id: "3.6",
              what: "Notificaciones",
              steps: "Ícono de campana",
              expect: "Lista de alertas/tareas; filtros y recordatorios en ⋮",
            },
          ]}
        />

        <h2 id="chats">4. Chats (bandeja WhatsApp / Instagram)</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "4.1",
              what: "Lista de chats",
              steps: "Tab Chats",
              expect: "Conversaciones con vista previa y hora",
            },
            {
              id: "4.2",
              what: "Buscar / filtrar",
              steps: "Buscá por nombre; chips (canal, Nuevo, Oportunidad, Abierto, Archivado)",
              expect: "Filtra bien",
            },
            {
              id: "4.3",
              what: "Deslizar fila",
              steps: "Deslizá izquierda/derecha",
              expect: "No leído, Más, Archivar / Desarchivar, silenciar, etc.",
            },
            {
              id: "4.4",
              what: "Abrir hilo",
              steps: "Tocá un chat",
              expect: "Mensajes en tiempo real; se marca leído",
            },
            {
              id: "4.5",
              what: "Responder texto",
              steps: "Escribí y enviá",
              expect: "Sale como mensaje saliente",
            },
            {
              id: "4.6",
              what: "Nota de voz",
              steps: "Mic con campo vacío → grabá → enviá",
              expect: "Se envía audio; se reproduce en el hilo",
            },
            {
              id: "4.7",
              what: "Dictado a texto",
              steps: "Mic del teclado con texto enfocado",
              expect: "Transcribe al campo; revisás antes de enviar",
            },
            {
              id: "4.8",
              what: "Adjuntar",
              steps: "Adjuntar imagen / archivo según opciones",
              expect: "Se envía y se ve en el hilo",
            },
            {
              id: "4.9",
              what: "Reacciones",
              steps: "Mantener mensaje → emoji",
              expect: "Reacción visible",
            },
            {
              id: "4.10",
              what: "Menú del mensaje",
              steps:
                "Responder, reenviar, copiar, editar (propios), etiquetar, eliminar, Preguntar a Copi",
              expect: "Cada acción hace lo esperado",
            },
            {
              id: "4.11",
              what: "Etiqueta / lead",
              steps: "Asigná Nuevo / Oportunidad / etc.",
              expect: "Se refleja en lista y filtros",
            },
            {
              id: "4.12",
              what: "Instagram (si aplica)",
              steps: "Integraciones → Instagram → conectar",
              expect: "Mensajes en Chats; respetá ventana 24 h",
            },
            {
              id: "4.13",
              what: "Agregar contacto",
              steps: "Desde el hilo → agregar a la agenda del teléfono",
              expect: "Contacto en la agenda del dispositivo",
            },
          ]}
        />

        <h2 id="copi">5. Copi (asistente)</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "5.1",
              what: "Chat con Copi",
              steps: "Tab Copi → preguntá algo del negocio",
              expect: "Responde en español, con contexto",
            },
            {
              id: "5.2",
              what: "Confirmaciones",
              steps: "Pedile crear tarea / enviar WhatsApp / cambio sensible",
              expect: "Te pide confirmar sí/no antes de ejecutar",
            },
            {
              id: "5.3",
              what: "Varias tareas",
              steps: "Pedile varias tareas numeradas",
              expect: "Propone varias; al confirmar se crean",
            },
            {
              id: "5.4",
              what: "Fechas / turnos",
              steps: "Pedile un turno o recordatorio con día poco claro",
              expect: "Interpreta bien o te pide aclarar",
            },
            {
              id: "5.5",
              what: "Voz a texto",
              steps: "Mic en Copi",
              expect: "Transcribe al cuadro; revisás y enviás",
            },
            {
              id: "5.6",
              what: "Imagen",
              steps: "Adjuntá foto (stock, remito, etc.) si está disponible",
              expect: "Interpreta y responde",
            },
            {
              id: "5.7",
              what: "Desde un chat",
              steps: "En un mensaje → Preguntar a Copi",
              expect: "Abre Copi con ese contexto",
            },
            {
              id: "5.8",
              what: "Historial",
              steps: "Salí y volvé a Copi",
              expect: "Retoma la sesión / historial reciente",
            },
          ]}
        />

        <h2 id="ventas">6. Ventas (botón $)</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "6.1",
              what: "Abrir venta",
              steps: "Tocá el botón $",
              expect: "Lista / carrito de venta",
            },
            {
              id: "6.2",
              what: "Buscar / escanear",
              steps: "Buscá producto o escaneá código",
              expect: "Agrega al carrito",
            },
            {
              id: "6.3",
              what: "Cantidades y precio",
              steps: "Cambiá cantidades",
              expect: "Totales correctos (formato AR, ej. $1.250)",
            },
            {
              id: "6.4",
              what: "Cobrar",
              steps: "Cobrar / confirmar cobro",
              expect: "Venta cerrada; stock baja",
            },
            {
              id: "6.5",
              what: "Stock insuficiente",
              steps: "Intentá vender más de lo disponible",
              expect: "No permite stock negativo",
            },
            {
              id: "6.6",
              what: "Interrumpir venta",
              steps: "Salí a mitad de venta y volvé",
              expect: "Carrito se recupera o avisa con claridad",
            },
          ]}
        />

        <h2 id="inventario">7. Inventario y productos</h2>
        <h3>7.1 Catálogo y stock</h3>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "7.1.1",
              what: "Gestionar stock",
              steps: "Más → Gestionar stock",
              expect: "Lista de productos con stock",
            },
            {
              id: "7.1.2",
              what: "Buscar",
              steps: "Escribí nombre / código",
              expect: "Filtra resultados",
            },
            {
              id: "7.1.3",
              what: "Filtrar categorías",
              steps: "Abrí filtros de categoría",
              expect: "Solo productos de esas categorías",
            },
            {
              id: "7.1.4",
              what: "Agregar producto",
              steps: "Más → Agregar producto",
              expect: "Nombre, precio, unidad, umbral, varias categorías",
            },
            {
              id: "7.1.5",
              what: "Unidad litro",
              steps: "Alta con unidad litro",
              expect: "Se guarda y se usa en stock/ventas",
            },
            {
              id: "7.1.6",
              what: "Varias categorías",
              steps: "Asigná 2+ categorías al mismo producto",
              expect: "Se ven en ficha y en filtros",
            },
            {
              id: "7.1.7",
              what: "Detalle de producto",
              steps: "Tocá un producto",
              expect: "Stock, acciones, categorías",
            },
            {
              id: "7.1.8",
              what: "Editar / agregar stock",
              steps: "Desde el producto",
              expect: "Stock y precio se actualizan",
            },
            {
              id: "7.1.9",
              what: "Código de barras / QR",
              steps: "Producto → Gestionar código → escanear o pegar",
              expect: "Código asociado; sirve para buscar",
            },
            {
              id: "7.1.10",
              what: "Escanear desde stock",
              steps: "Cámara en Gestionar stock",
              expect: "Encuentra el producto correcto",
            },
            {
              id: "7.1.11",
              what: "Lotes y movimientos",
              steps: "Más → Lotes y Movimientos",
              expect: "Historial coherente con altas/ventas/compras",
            },
            {
              id: "7.1.12",
              what: "Eliminar producto",
              steps: "Desde detalle (si aplica)",
              expect: "Se archiva / deja de venderse según reglas",
            },
          ]}
        />

        <h3>7.2 Granel y subproductos</h3>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "7.2.1",
              what: "Producto Granel",
              steps: "Creá/editá producto con categoría Granel",
              expect: "Aparece opción de subproductos",
            },
            {
              id: "7.2.2",
              what: "Agregar subproducto",
              steps: "Desde ese producto → agregar subproducto",
              expect: "Queda vinculado al padre",
            },
            {
              id: "7.2.3",
              what: "Sin Granel",
              steps: "Producto sin categoría Granel",
              expect: "No debería ofrecer subproductos",
            },
            {
              id: "7.2.4",
              what: "Venta / stock",
              steps: "Mové stock del padre/hijo según tu flujo",
              expect: "Cantidades y conversión coherentes",
            },
          ]}
        />

        <h2 id="compras">8. Compras y proveedores</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "8.1",
              what: "Proveedores",
              steps: "Más → Proveedores → alta",
              expect: "Se guarda en el negocio (compartido entre dispositivos)",
            },
            {
              id: "8.2",
              what: "Otro dispositivo",
              steps: "Abrí la app en otro celular del mismo negocio",
              expect: "Ves el mismo proveedor",
            },
            {
              id: "8.3",
              what: "Cargar compra",
              steps: "Más → Compras → Cargar compra",
              expect: "Número, fecha, proveedor, líneas de productos padre",
            },
            {
              id: "8.4",
              what: "Ajuste",
              steps: "Descuento o recargo en % o $",
              expect: "Subtotal → ajuste se recalcula",
            },
            {
              id: "8.5",
              what: "IVA",
              steps: "Checkbox Aplicar IVA + alícuota",
              expect: "Total = subtotal → ajuste → IVA",
            },
            {
              id: "8.6",
              what: "Guardar (pendiente)",
              steps: "Guardar compra",
              expect: "Queda pendiente; aún no mueve stock",
            },
            {
              id: "8.7",
              what: "Editar pendiente",
              steps: "Abrí detalle / Editar",
              expect: "Podés cambiar líneas, IVA y ajuste",
            },
            {
              id: "8.8",
              what: "Confirmar",
              steps: "Gestionar compras → Marcar como confirmada",
              expect: "Entra stock/lotes; IVA y ajuste se bloquean",
            },
            {
              id: "8.9",
              what: "Volver a pendiente",
              steps: "Marcar como pendiente de confirmación",
              expect: "Revierte stock/precios según flujo; reabre edición",
            },
            {
              id: "8.10",
              what: "Escanear en compra",
              steps: "Cámara en Cargar compra",
              expect: "Agrega el producto correcto",
            },
          ]}
        />

        <h2 id="tareas">9. Tareas y notificaciones</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "9.1",
              what: "Centro de tareas",
              steps: "Más → Notificaciones y Tareas / Ver todas",
              expect: "Lista filtrable (pendiente, en curso, etc.)",
            },
            {
              id: "9.2",
              what: "Crear tarea",
              steps: "Nueva tarea: título, asunto, vencimiento, asignado",
              expect: "Se crea y aparece en la lista",
            },
            {
              id: "9.3",
              what: "Acciones ⋮",
              steps:
                "Seguir, posponer, silenciar 10 min, iniciar, completar, reasignar, cancelar",
              expect: "Cada acción actualiza el estado",
            },
            {
              id: "9.4",
              what: "Detalle",
              steps: "Tocá la fila",
              expect: "Se lee el asunto completo; link a conversación si hay",
            },
            {
              id: "9.5",
              what: "Recordatorios",
              steps: "Notificaciones → ⋮ → Recordatorios (15/30/60)",
              expect: "Preferencia guardada",
            },
            {
              id: "9.6",
              what: "Push (si está activo)",
              steps: "Pedí permiso de notificaciones",
              expect: "Llegan alertas de stock/tareas en segundo plano",
            },
          ]}
        />

        <h2 id="caja">10. Caja y reportes</h2>
        <p>
          Disponible según el plan / módulos de tu negocio. Si no ves Caja, puede no estar
          habilitado.
        </p>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "10.1",
              what: "Caja del día",
              steps: "Más → Caja",
              expect: "Saldo / movimientos del día",
            },
            {
              id: "10.2",
              what: "Movimiento manual",
              steps: "Cargá ingreso o egreso",
              expect: "Queda registrado",
            },
            {
              id: "10.3",
              what: "Informe",
              steps: "Más → Reportes · Balances (rango de fechas)",
              expect: "Vista / export coherente con la caja",
            },
            {
              id: "10.4",
              what: "Calendario",
              steps: "Navegá días en Caja",
              expect: "Cambia el día y el saldo mostrado",
            },
          ]}
        />

        <h2 id="sucursales">11. Multisucursal</h2>
        <p>Solo si tu plan incluye varias sucursales.</p>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "11.1",
              what: "Selector de centro",
              steps: "En el header, elegí sucursal",
              expect: "Stock, chats y caja siguen esa sucursal",
            },
            {
              id: "11.2",
              what: "Alta de sucursales",
              steps: "Configuración → Sucursales",
              expect: "Crear / editar centros",
            },
            {
              id: "11.3",
              what: "Campo sucursal",
              steps: "En formularios de stock",
              expect: "Respeta el centro elegido",
            },
          ]}
        />

        <h2 id="integraciones">12. Integraciones y soporte</h2>
        <GuideTable
          headers={HEADERS}
          rows={[
            {
              id: "12.1",
              what: "WhatsApp Business",
              steps: "Mi cuenta / banner → conectar (Phone Number ID, etc.)",
              expect: "Estado conectado en Inicio y Chats",
            },
            {
              id: "12.2",
              what: "Instagram",
              steps: "Integraciones → Instagram",
              expect: "Conexión OAuth; mensajes en bandeja",
            },
            {
              id: "12.3",
              what: "Facturación",
              steps: "Más → Facturación",
              expect: "Presupuestos / facturas según lo habilitado",
            },
            {
              id: "12.4",
              what: "Privacidad y datos",
              steps: "Más → Privacidad",
              expect: "Info clara; flujos de baja si aplica",
            },
            {
              id: "12.5",
              what: "Ayuda",
              steps: "Más → Ayuda y soporte",
              expect: "Contacto / links útiles",
            },
          ]}
        />

        <h2 id="recorrido">13. Recorrido sugerido</h2>
        <ol>
          <li>
            Empezar:{" "}
            <a href="#negocio-nuevo">registrar negocio</a> o{" "}
            <a href="#unirse-qr">unirse con QR</a>
          </li>
          <li>
            <a href="#acceso">Login y sesión</a>
          </li>
          <li>
            <a href="#inicio">Inicio y notificaciones</a>
          </li>
          <li>
            <a href="#chats">Chats</a> (texto, voz, etiquetas)
          </li>
          <li>
            Producto con varias categorías + litro +{" "}
            <a href="#inventario">Granel / subproducto</a>
          </li>
          <li>
            <a href="#compras">Proveedor → Cargar compra con IVA → confirmar</a>
          </li>
          <li>
            <a href="#ventas">Venta ($)</a> del producto cargado
          </li>
          <li>Lotes y movimientos</li>
          <li>
            <a href="#copi">Copi</a>: una consulta + una tarea con confirmación
          </li>
          <li>
            <a href="#caja">Caja</a> / <a href="#sucursales">sucursales</a> si aplican
          </li>
        </ol>

        <h2 id="reportar">14. Cómo reportar un problema</h2>
        <p>Enviá a <a href="mailto:hola@nexolia.com.ar">hola@nexolia.com.ar</a>:</p>
        <ol>
          <li>Celular y sistema (ej. Android 14 / iPhone, iOS 18)</li>
          <li>Usuario / negocio de prueba</li>
          <li>Pantalla y pasos exactos</li>
          <li>Qué esperabas vs qué pasó (captura o video corto ayuda mucho)</li>
        </ol>

        <p className="guide-cta">
          ¿Todavía no tenés negocio?{" "}
          <Link className="btn btn-primary" href="/comenzar">
            Comenzar alta
          </Link>
        </p>
      </main>

      <footer className="site-footer">
        <Link href="/">Inicio</Link>
        {" · "}
        <Link href="/comenzar">Comenzar</Link>
        {" · "}
        <Link href="/privacidad">Privacidad</Link>
        {" · "}
        <Link href="/eliminacion-de-cuenta">Eliminación de cuenta</Link>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
