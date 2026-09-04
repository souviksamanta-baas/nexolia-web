# Nexolia Web — Architecture

Public onboarding at **nexolia.com.ar** and staff portal at **admin.nexolia.com.ar** share the `nexolia-web` Next.js app (host-based routing). Business logic stays in `baas-mvp` (Nest API + Supabase). The desktop QR product at `web.nexolia.com.ar` is a separate repo.

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| App | Next.js App Router, TypeScript, Tailwind | Replaces static `server.mjs` |
| Hosting | Railway | Apex + `admin.nexolia.com.ar` (Cloudflare DNS) |
| Brand | Navy `#101935`, green `#08bd66` | Design system tokens |
| Staff auth | Supabase email/password (`nexolia_staff` / invites); Google OAuth later |
| Client auth | Not on this site (v1) | Mobile OTP in baas-mvp |
| API | NestJS in baas-mvp | `/admin/*`, public lead POST |
| Data | Same Supabase as the app | RLS for clients; service-role in Nest admin |
| AI | xAI Grok via Nest | Browser never holds `XAI_API_KEY` |
| Not this repo | Expo, Nest process, `nexolia-webapp` | — |

## System context

```mermaid
flowchart LR
  Prospect[Prospect browser]
  Staff[Nexolia staff browser]
  Web[nexolia-web Next.js]
  Mobile[Nexolia Expo app]
  Nest[baas-mvp Nest API]
  SB[Supabase Auth and Postgres]
  Grok[xAI Grok]
  Prospect --> Web
  Staff --> Web
  Web -->|"public lead POST"| Nest
  Web -->|"staff JWT"| Nest
  Nest --> SB
  Nest --> Grok
  Mobile -->|"client OTP JWT"| Nest
  Mobile --> SB
```

## Surfaces

```mermaid
flowchart TB
  subgraph apex [nexolia.com.ar]
    Onboard["/comenzar public"]
    Legal["/privacidad etc"]
  end
  subgraph adminHost [admin.nexolia.com.ar]
    Admin[Staff portal]
  end
  subgraph product [baas-mvp]
    App[Expo owner app]
    API[Nest API]
    DB[Supabase]
  end
  subgraph desktop [not this project]
    Webapp["web.nexolia.com.ar QR desktop"]
  end
  Onboard --> API
  Admin --> API
  App --> API
  App --> DB
  API --> DB
  Webapp -.-> API
```

## Lead → staff convert → app attach

```mermaid
sequenceDiagram
  participant P as Prospect
  participant W as nexolia-web
  participant A as Nest API
  participant S as admin.nexolia.com.ar
  participant M as Expo app
  P->>W: /comenzar steps 1-3
  W->>A: POST lead no auth
  A-->>W: thank you plus transfer instructions
  S->>A: convert lead create org register owner
  S->>A: confirm cash or transfer
  M->>A: client email OTP
  A-->>M: attach owner membership
```

## Unprovisioned app user

```mermaid
sequenceDiagram
  participant U as New user
  participant M as Expo app
  participant W as nexolia.com.ar/comenzar
  U->>M: OTP login
  M-->>U: not enabled yet
  U->>W: open /comenzar
```

## Epic

[KAN-405](https://souviksamanta.atlassian.net/browse/KAN-405) — Admin portal + client onboarding
