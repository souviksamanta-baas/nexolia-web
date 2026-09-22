type EnvLike = Record<string, string | undefined>;

export function nestApiBase(env: EnvLike = process.env): string {
  return (
    env.BAAS_API_URL ||
    env.NEXT_PUBLIC_BAAS_API_URL ||
    "https://baas-project-production.up.railway.app"
  ).replace(/\/$/, "");
}
