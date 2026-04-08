import { rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { POST as webhookPost } from "@/app/api/toss/webhook/route";
import { GET as replayGet, POST as replayPost } from "@/app/api/toss/webhook/replay/route";

const deadLetterDir = join(process.cwd(), ".data", "dead-letter");

describe("WH-004 dead-letter replay", () => {
  it("처리 실패 웹훅이 dead-letter에 저장되고 재처리 상태로 변경된다", async () => {
    await rm(deadLetterDir, { recursive: true, force: true });
    delete process.env.TOSS_WEBHOOK_SECRET;

    const request = new Request("http://localhost/api/toss/webhook", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const failedResponse = await webhookPost(request);
    const failedBody = await failedResponse.json();
    expect(failedResponse.status).toBe(500);
    expect(failedBody.deadLetterId).toBeTruthy();

    const listResponse = await replayGet();
    const listBody = await listResponse.json();
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listBody.items)).toBe(true);
    expect(listBody.items.length).toBeGreaterThan(0);

    const replayResponse = await replayPost(
      new Request("http://localhost/api/toss/webhook/replay", {
        method: "POST",
        body: JSON.stringify({ deadLetterId: failedBody.deadLetterId }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const replayBody = await replayResponse.json();
    expect(replayResponse.status).toBe(200);
    expect(replayBody.item.status).toBe("replayed");
  });
});
