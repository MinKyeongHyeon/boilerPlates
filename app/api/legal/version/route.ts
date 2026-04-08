import { NextResponse } from "next/server";
import { getPolicyVersions } from "@/lib/policy-store";

export async function GET() {
  return NextResponse.json({ ok: true, versions: getPolicyVersions() }, { status: 200 });
}
