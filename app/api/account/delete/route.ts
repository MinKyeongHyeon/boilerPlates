import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { writeAuditLog } from "@/lib/audit-log";

type DeleteAccountBody = {
  confirmText?: string;
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "ERROR",
        metadata: { reason: "missing_supabase_envs" },
      });
      return NextResponse.json({ ok: false, message: "Supabase 환경 변수가 설정되지 않았습니다." }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "WARN",
        metadata: { reason: "missing_auth_header" },
      });
      return NextResponse.json({ ok: false, message: "유효한 인증 토큰이 필요합니다." }, { status: 401 });
    }
    const userAccessToken = authHeader.replace("Bearer ", "");

    const body = (await request.json()) as DeleteAccountBody;
    if (body.confirmText !== "DELETE") {
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "WARN",
        metadata: { reason: "invalid_confirm_text" },
      });
      return NextResponse.json({ ok: false, message: "확인 문구가 올바르지 않습니다." }, { status: 400 });
    }

    const meResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        apikey: anonKey,
      },
    });
    if (!meResponse.ok) {
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "WARN",
        metadata: { reason: "user_token_verification_failed" },
      });
      return NextResponse.json({ ok: false, message: "사용자 인증 검증에 실패했습니다." }, { status: 401 });
    }

    const me = (await meResponse.json()) as { id?: string };
    if (!me.id) {
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "WARN",
        metadata: { reason: "missing_user_id" },
      });
      return NextResponse.json({ ok: false, message: "사용자 ID를 확인할 수 없습니다." }, { status: 401 });
    }

    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${me.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });

    if (!deleteResponse.ok) {
      const errorBody = await deleteResponse.json().catch(() => ({}));
      await writeAuditLog({
        action: "ACCOUNT_DELETE_REQUEST",
        status: "FAILED",
        level: "ERROR",
        actorId: me.id,
        targetId: me.id,
        metadata: { reason: "supabase_delete_failed", errorBody },
      });
      return NextResponse.json(
        { ok: false, message: "계정 삭제에 실패했습니다.", detail: errorBody },
        { status: deleteResponse.status },
      );
    }

    await writeAuditLog({
      action: "ACCOUNT_DELETE_REQUEST",
      status: "SUCCESS",
      actorId: me.id,
      targetId: me.id,
    });
    return NextResponse.json({ ok: true, message: "계정이 삭제되었습니다." }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    await writeAuditLog({
      action: "ACCOUNT_DELETE_REQUEST",
      status: "FAILED",
      level: "ERROR",
      metadata: { message: error instanceof Error ? error.message : "unknown_error" },
    });
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "계정 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
