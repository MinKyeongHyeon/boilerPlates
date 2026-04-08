import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/account/delete/route";

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";
  });

  it("confirmText가 DELETE가 아니면 400을 반환한다", async () => {
    const request = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: {
        Authorization: "Bearer user_access_token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirmText: "WRONG" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("인증 헤더가 없으면 401을 반환한다", async () => {
    const request = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmText: "DELETE" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("정상 요청이면 200을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: "user_123" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
        .mockResolvedValueOnce(new Response(null, { status: 200 })),
    );

    const request = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: {
        Authorization: "Bearer user_access_token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirmText: "DELETE" }),
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
