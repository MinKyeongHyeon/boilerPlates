"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

type ConsentCheck = {
  needsTerms: boolean;
  needsPrivacy: boolean;
  latestTermsVersion?: string;
  latestPrivacyVersion?: string;
};

export function LegalConsentBanner() {
  const session = useAuthStore((state) => state.session);
  const [check, setCheck] = useState<ConsentCheck | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!session?.user?.id) {
        setCheck(null);
        return;
      }
      const response = await fetch(`/api/legal/consent?userId=${encodeURIComponent(session.user.id)}`);
      const data = await response.json();
      if (!response.ok) return;

      const latestTerms = data.latest?.terms?.version;
      const latestPrivacy = data.latest?.privacy?.version;
      const currentTerms = data.current?.terms?.policyVersion;
      const currentPrivacy = data.current?.privacy?.policyVersion;

      setCheck({
        needsTerms: latestTerms && currentTerms !== latestTerms,
        needsPrivacy: latestPrivacy && currentPrivacy !== latestPrivacy,
        latestTermsVersion: latestTerms,
        latestPrivacyVersion: latestPrivacy,
      });
    };
    run();
  }, [session?.user?.id]);

  const agreeAll = async () => {
    if (!session?.user?.id || !check) return;
    setSubmitting(true);
    try {
      if (check.needsTerms && check.latestTermsVersion) {
        await fetch("/api/legal/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            policyType: "terms",
            policyVersion: check.latestTermsVersion,
          }),
        });
      }
      if (check.needsPrivacy && check.latestPrivacyVersion) {
        await fetch("/api/legal/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            policyType: "privacy",
            policyVersion: check.latestPrivacyVersion,
          }),
        });
      }
      setCheck((prev) => (prev ? { ...prev, needsTerms: false, needsPrivacy: false } : prev));
    } finally {
      setSubmitting(false);
    }
  };

  if (!session || !check || (!check.needsTerms && !check.needsPrivacy)) return null;

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <p>
          최신 정책 동의가 필요합니다.{" "}
          <Link href="/legal/terms" className="underline">
            이용약관
          </Link>{" "}
          /{" "}
          <Link href="/legal/privacy" className="underline">
            개인정보처리방침
          </Link>
        </p>
        <button
          className="rounded-md bg-yellow-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          onClick={agreeAll}
          type="button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "동의 처리 중..." : "최신 정책 동의"}
        </button>
      </div>
    </div>
  );
}
