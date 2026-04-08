import { NextResponse } from "next/server";
import { getLatestPolicyVersion, getUserLatestConsents, savePolicyConsent, type PolicyType } from "@/lib/policy-store";

type ConsentBody = {
  userId?: string;
  policyType?: PolicyType;
  policyVersion?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ ok: false, message: "userId가 필요합니다." }, { status: 400 });
  }

  const latest = {
    terms: getLatestPolicyVersion("terms"),
    privacy: getLatestPolicyVersion("privacy"),
  };
  const current = await getUserLatestConsents(userId);

  return NextResponse.json({ ok: true, latest, current }, { status: 200 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ConsentBody;
  if (!body.userId || !body.policyType || !body.policyVersion) {
    return NextResponse.json({ ok: false, message: "userId, policyType, policyVersion이 필요합니다." }, { status: 400 });
  }

  const latest = getLatestPolicyVersion(body.policyType);
  if (!latest) {
    return NextResponse.json({ ok: false, message: "정책 버전을 찾을 수 없습니다." }, { status: 404 });
  }
  if (latest.version !== body.policyVersion) {
    return NextResponse.json(
      { ok: false, message: "최신 정책 버전 동의가 필요합니다.", latestVersion: latest.version },
      { status: 409 },
    );
  }

  const consent = await savePolicyConsent({
    userId: body.userId,
    policyType: body.policyType,
    policyVersion: body.policyVersion,
  });
  return NextResponse.json({ ok: true, consent }, { status: 200 });
}
