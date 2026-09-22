type EnvLike = Record<string, string | undefined>;

export function isMockupsEnabled(env: EnvLike = process.env): boolean {
  if (env.NEXOLIA_ENABLE_MOCKUPS === "true") {
    return true;
  }
  return env.NODE_ENV !== "production";
}
