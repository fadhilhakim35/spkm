const DEV_ENV_PLACEHOLDERS = new Set([
  "local-dev-placeholder",
  "spkm-local-dev",
  "local-dev-secret-change-me",
]);

function isProductionEnvironment(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in Vercel or your local .env file before starting the app.`,
    );
  }

  if (isProductionEnvironment() && DEV_ENV_PLACEHOLDERS.has(value)) {
    throw new Error(
      `Production build detected a development placeholder for ${name}. Replace it with a real value before deploying.`,
    );
  }

  return value;
}

export function getRequiredAuthSecret(): string {
  const value = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!value) {
    throw new Error(
      "Missing required auth secret. Set AUTH_SECRET (preferred) or NEXTAUTH_SECRET in your environment before starting the app.",
    );
  }

  if (isProductionEnvironment() && DEV_ENV_PLACEHOLDERS.has(value)) {
    throw new Error(
      "Production build detected a development placeholder for the auth secret. Generate a secure random value before deploying.",
    );
  }

  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = value;
  }

  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = value;
  }

  return value;
}

export function getRequiredAuthUrl(): string {
  const value = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim();

  if (!value) {
    throw new Error(
      "Missing required auth URL. Set NEXTAUTH_URL (preferred) or AUTH_URL to your production domain before starting the app.",
    );
  }

  if (isProductionEnvironment()) {
    const invalidHosts = ["localhost", "127.0.0.1", "[::1]"];
    const hostname = new URL(value).hostname;

    if (invalidHosts.includes(hostname)) {
      throw new Error(
        `Production environment cannot use localhost for NEXTAUTH_URL. Set a real domain like https://your-domain.com instead of ${value}.`,
      );
    }
  }

  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = value;
  }

  return value;
}
