import Link from "next/link";

export function MktFooter() {
  return (
    <footer className="mkt-footer">
      © {new Date().getFullYear()} Nexolia ·{" "}
      <Link href="/privacidad">Privacidad</Link> ·{" "}
      <Link href="/eliminacion-de-cuenta">Eliminación de cuenta</Link>
    </footer>
  );
}
