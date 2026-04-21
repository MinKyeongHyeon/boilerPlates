"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { LegalConsentBanner } from "@/features/legal/components/legal-consent-banner";
import { LegalModal } from "@/features/legal/components/legal-modal";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/auth-store";

// 범용적으로 사용 가능한 OAuth 공급자 Config
const OAUTH_PROVIDERS = [
  { id: "kakao", label: "카카오 로그인", bgColor: "bg-yellow-300", textColor: "text-black" },
  { id: "naver", label: "네이버 로그인", bgColor: "bg-green-600", textColor: "text-white" },
  // 구글 등을 쉽게 추가 가능: { id: "google", label: "Google 로그인", bgColor: "bg-white", textColor: "text-black" }
] as const;

export function Gnb() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const signIn = async (provider: string) => {
    await supabase.auth.signInWithOAuth({
      provider: provider as never,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <AuthProvider />
      <LegalConsentBanner />
      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold">
            Korean SaaS Boilerplate
          </Link>
          <nav className="flex items-center gap-2">
            <button
              className="rounded-md px-3 py-2 text-sm text-muted hover:bg-gray-100"
              onClick={() => setModalType("terms")}
              type="button"
            >
              이용약관
            </button>
            <button
              className="rounded-md px-3 py-2 text-sm text-muted hover:bg-gray-100"
              onClick={() => setModalType("privacy")}
              type="button"
            >
              개인정보처리방침
            </button>
            {!isLoading && !session && (
              <>
                {OAUTH_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    className={`rounded-md px-3 py-2 text-sm font-semibold ${provider.bgColor} ${provider.textColor}`}
                    onClick={() => signIn(provider.id)}
                    type="button"
                  >
                    {provider.label}
                  </button>
                ))}
              </>
            )}
            {!isLoading && session && (
              <>
                <Link
                  href="/payments/one-time"
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  단건 결제
                </Link>
                <Link
                  href="/payments/subscription"
                  className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
                >
                  정기 구독
                </Link>
                <button
                  className="rounded-md border border-border px-3 py-2 text-sm"
                  onClick={signOut}
                  type="button"
                >
                  로그아웃
                </button>
                <DeleteAccountButton />
              </>
            )}
          </nav>
        </div>
      </header>
      <LegalModal type={modalType} onClose={() => setModalType(null)} />
    </>
  );
}
