import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Static HTML mockup files live in /mockups at the repo root; they are
  // served via app/mockups/[[...slug]]/route.ts. The mockup pages reference
  // `../../public/nexolia-logo.svg`, so we alias `/public/*` → `/*` so those
  // references keep working without touching the QA HTML.
  async rewrites() {
    return [
      { source: "/public/:path*", destination: "/:path*" },
    ];
  },
  async redirects() {
    return [
      { source: "/privacy", destination: "/privacidad", permanent: true },
      { source: "/account-deletion", destination: "/eliminacion-de-cuenta", permanent: true },
      { source: "/onboarding", destination: "/comenzar", permanent: true },
      { source: "/onboarding/:path*", destination: "/comenzar", permanent: true },
    ];
  },
};

export default nextConfig;
