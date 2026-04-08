import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("제한 이하 요청은 허용한다", () => {
    const r1 = checkRateLimit({ key: "k-allow", limit: 2, windowMs: 1000, now: 1000 });
    const r2 = checkRateLimit({ key: "k-allow", limit: 2, windowMs: 1000, now: 1001 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("제한 초과 요청은 차단한다", () => {
    checkRateLimit({ key: "k-block", limit: 1, windowMs: 1000, now: 1000 });
    const blocked = checkRateLimit({ key: "k-block", limit: 1, windowMs: 1000, now: 1001 });
    expect(blocked.allowed).toBe(false);
  });

  it("윈도우가 지나면 다시 허용한다", () => {
    checkRateLimit({ key: "k-reset", limit: 1, windowMs: 1000, now: 1000 });
    checkRateLimit({ key: "k-reset", limit: 1, windowMs: 1000, now: 1001 });
    const reset = checkRateLimit({ key: "k-reset", limit: 1, windowMs: 1000, now: 2500 });
    expect(reset.allowed).toBe(true);
  });
});
