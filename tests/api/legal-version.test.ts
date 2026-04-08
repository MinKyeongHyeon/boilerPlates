import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/legal/version/route";

describe("GET /api/legal/version", () => {
  it("정책 버전 목록을 반환한다", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.versions)).toBe(true);
    expect(body.versions.length).toBeGreaterThanOrEqual(2);
  });
});
