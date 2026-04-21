"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // PKCE 및 Implicit Flow 모두 대응을 위해 onAuthStateChange 활용
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/");
      }
    });

    // 만약 일정 시간 내 인증 세션이 잡히지 않으면 오류 처리(혹은 홈 리다이렉트)
    const timeout = setTimeout(async () => {
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session) {
        setErrorMsg("인증 정보가 없습니다. 홈으로 돌아갑니다.");
        setTimeout(() => router.replace("/"), 2000);
      }
    }, 3000);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 text-center">
      <p className="text-sm text-muted">
        {errorMsg ? errorMsg : "로그인 처리 중입니다. 잠시만 기다려주세요..."}
      </p>
    </main>
  );
}
