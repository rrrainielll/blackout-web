export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function ensureEnv(names: string[]) {
  names.forEach(requireEnv);
}
