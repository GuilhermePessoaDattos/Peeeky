/**
 * Environment variable validation — runs at build time and app startup.
 * If any required variable is missing, the build/start will fail with a clear message.
 */

const required = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "CRON_SECRET",
] as const;

const optional = [
  "STRIPE_PUBLISHABLE_KEY",
  "CLOUDCONVERT_API_KEY",
  "NEXT_PUBLIC_GTM_ID",
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `\n\n❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join("\n")}\n\nSet them in .env (local) or Vercel dashboard (production).\nSee .env.example for reference.\n`
    );
  }

  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `⚠️  Optional env vars not set: ${missingOptional.join(", ")}`
    );
  }
}
