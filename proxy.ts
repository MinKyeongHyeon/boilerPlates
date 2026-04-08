import { NextResponse, type NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

type Bucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalForRateLimit.__rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__rateLimitBuckets = buckets;

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.tosspayments.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.tosspayments.com https://*.supabase.co; frame-src https://js.tosspayments.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
  );
  return response;
}

function readClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkAndIncrease(key: string, now: number) {
  const current = buckets.get(key);
  if (!current || now > current.resetAt) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(key, next);
    return { allowed: true, bucket: next };
  }
  current.count += 1;
  buckets.set(key, current);
  return { allowed: current.count <= RATE_LIMIT_MAX, bucket: current };
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const shouldRateLimit = pathname.startsWith("/api/toss/") || pathname === "/api/account/delete";

  if (shouldRateLimit) {
    const ip = readClientIp(request);
    const key = `${ip}:${pathname}`;
    const result = checkAndIncrease(key, Date.now());

    if (!result.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.bucket.resetAt - Date.now()) / 1000));
      const response = NextResponse.json(
        { ok: false, message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(retryAfterSeconds));
      return applySecurityHeaders(response);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
