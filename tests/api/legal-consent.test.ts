import { rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/legal/consent/route";

const consentFile = join(process.cwd(), ".data", "policy-consents.json");

describe("GET/POST /api/legal/consent", () => {
  it("GET은 userId가 없으면 400을 반환한다", async () => {
    const response = await GET(new Request("http://localhost/api/legal/consent"));
    expect(response.status).toBe(400);
  });

  it("POST는 필수값 없으면 400을 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/legal/consent", {
        method: "POST",
        body: JSON.stringify({ userId: "u1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("최신 버전 동의를 저장하고 조회한다", async () => {
    await rm(consentFile, { force: true });

    const save = await POST(
      new Request("http://localhost/api/legal/consent", {
        method: "POST",
        body: JSON.stringify({
          userId: "user_legal_1",
          policyType: "terms",
          policyVersion: "v1.0.0",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(save.status).toBe(200);

    const read = await GET(new Request("http://localhost/api/legal/consent?userId=user_legal_1"));
    const body = await read.json();
    expect(read.status).toBe(200);
    expect(body.current.terms.policyVersion).toBe("v1.0.0");
  });

  it("구버전 동의 요청은 409를 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/legal/consent", {
        method: "POST",
        body: JSON.stringify({
          userId: "user_legal_old",
          policyType: "terms",
          policyVersion: "v0.9.0",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(409);
  });
});
