import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nexolia.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nexolia — Tu negocio, más inteligente",
    template: "%s · Nexolia",
  },
  description:
    "Nexolia es el asistente inteligente para dueños de negocios: unifica tu bandeja de WhatsApp, CRM e inventario en una sola app.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Nexolia — Tu negocio, más inteligente",
    description:
      "Unificá WhatsApp, CRM e inventario. Onboarding en minutos para tu comercio o servicio.",
    url: siteUrl,
    siteName: "Nexolia",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${dmSans.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
