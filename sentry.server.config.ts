import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
  tracesSampleRate: 1.0,
  release: process.env.NEXT_PUBLIC_APP_RELEASE || process.env.APP_RELEASE,
});
