import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

// Upstash 클라이언트 (환경변수 존재 시)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(redisUrl && redisToken);

const upstashRatelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, "1 m"),
      analytics: true,
    })
  : null;

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

// 단순 인메모리 Fallback 버전
function checkAndIncreaseInMemory(key: string, now: number) {
  const current = buckets.get(key);
  if (!current || now > current.resetAt) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(key, next);
    return { allowed: true, retryAfterSeconds: 0 };
  }
  current.count += 1;
  buckets.set(key, current);
  
  if (current.count > RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const shouldRateLimit = pathname.startsWith("/api/toss/") || pathname === "/api/account/delete";

  if (shouldRateLimit) {
    const ip = readClientIp(request);
    const key = `${ip}:${pathname}`;

    let isAllowed = true;
    let retryAfter = 0;

    if (upstashRatelimit) {
      // 1. Upstash Redis Rate Limit 적용
      const { success, reset } = await upstashRatelimit.limit(key);
      isAllowed = success;
      if (!success) retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    } else {
      // 2. 인메모리 Fallback Rate Limit 적용
      const result = checkAndIncreaseInMemory(key, Date.now());
      isAllowed = result.allowed;
      retryAfter = result.retryAfterSeconds;
    }

    if (!isAllowed) {
      const response = NextResponse.json(
        { ok: false, message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(retryAfter));
      return applySecurityHeaders(response);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
