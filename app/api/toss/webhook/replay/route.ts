import { NextResponse } from "next/server";
import { listDeadLetters, markDeadLetterReplayed } from "@/lib/dead-letter";

type ReplayRequestBody = {
  deadLetterId?: string;
};

export async function GET() {
  const records = await listDeadLetters();
  return NextResponse.json({ ok: true, items: records }, { status: 200 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReplayRequestBody;
  if (!body.deadLetterId) {
    return NextResponse.json({ ok: false, message: "deadLetterId가 필요합니다." }, { status: 400 });
  }

  try {
    const updated = await markDeadLetterReplayed(body.deadLetterId);
    return NextResponse.json({ ok: true, item: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "해당 dead-letter를 찾을 수 없습니다." }, { status: 404 });
  }
}
