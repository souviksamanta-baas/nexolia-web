"use client";

/**
 * Renders the mobile drawer overlay and wires the close-on-click behaviour
 * that the static mockup did with vanilla JS.
 */
export function SidebarOverlay() {
  const close = () => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("drawer-open");
  };
  return <div className="sidebar-overlay" onClick={close} aria-hidden />;
}
