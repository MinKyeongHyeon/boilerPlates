import { describe, expect, it } from "vitest";
import { getTossAuthHeader, getTossSecretKey } from "@/lib/toss-server";

describe("toss-server utils", () => {
  it("TOSS_SECRET_KEY가 없으면 예외를 던진다", () => {
    delete process.env.TOSS_SECRET_KEY;
    expect(() => getTossSecretKey()).toThrowError("TOSS_SECRET_KEY 환경 변수가 비어 있습니다.");
  });

  it("TOSS_SECRET_KEY를 정상 반환한다", () => {
    process.env.TOSS_SECRET_KEY = "test_sk_sample";
    expect(getTossSecretKey()).toBe("test_sk_sample");
  });

  it("Basic 인증 헤더를 생성한다", () => {
    const header = getTossAuthHeader("test_sk_sample");
    expect(header).toBe(`Basic ${Buffer.from("test_sk_sample:").toString("base64")}`);
  });
});
