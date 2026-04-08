"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { LegalConsentBanner } from "@/components/legal-consent-banner";
import { LegalModal } from "@/components/legal-modal";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/auth-store";

export function Gnb() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const signIn = async (provider: "kakao" | "naver") => {
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
                <button
                  className="rounded-md bg-yellow-300 px-3 py-2 text-sm font-semibold text-black"
                  onClick={() => signIn("kakao")}
                  type="button"
                >
                  카카오 로그인
                </button>
                <button
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => signIn("naver")}
                  type="button"
                >
                  네이버 로그인
                </button>
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
