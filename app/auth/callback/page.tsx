"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCode = async () => {
      const hash = window.location.hash;
      if (!hash) {
        router.replace("/");
        return;
      }

      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      router.replace("/");
    };

    exchangeCode();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 text-center">
      <p className="text-sm text-muted">로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </main>
  );
}
