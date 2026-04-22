type EnvLike = Record<string, string | undefined>;

export function isSafeDryRun(env: EnvLike = process.env): boolean {
  return env.SAFE_DRY_RUN !== "false";
}

export function canPostToX(env: EnvLike = process.env): boolean {
  return env.X_POSTING_ENABLED === "true" && !isSafeDryRun(env);
}

export function canCallHeyAnonLive(env: EnvLike = process.env): boolean {
  return env.HEYANON_ENABLE_LIVE_CALLS === "true";
}

export function assertServerOnlySecret(
  value: string | undefined,
  name: string
): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

