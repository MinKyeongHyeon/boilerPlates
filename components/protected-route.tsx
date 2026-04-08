"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isPolicyChecking, setIsPolicyChecking] = useState(false);
  const [isPolicyAgreed, setIsPolicyAgreed] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/?needsLogin=1");
    }
  }, [isLoading, router, session]);

  useEffect(() => {
    const run = async () => {
      if (isLoading || !session?.user?.id) return;
      setIsPolicyChecking(true);
      try {
        const response = await fetch(`/api/legal/consent?userId=${encodeURIComponent(session.user.id)}`);
        const data = await response.json();
        if (!response.ok) {
          setIsPolicyAgreed(false);
          return;
        }

        const latestTerms = data.latest?.terms?.version;
        const latestPrivacy = data.latest?.privacy?.version;
        const currentTerms = data.current?.terms?.policyVersion;
        const currentPrivacy = data.current?.privacy?.policyVersion;

        const needsTerms = latestTerms && currentTerms !== latestTerms;
        const needsPrivacy = latestPrivacy && currentPrivacy !== latestPrivacy;
        const agreed = !needsTerms && !needsPrivacy;
        setIsPolicyAgreed(agreed);
        if (!agreed) {
          router.replace("/legal/consent-required");
        }
      } finally {
        setIsPolicyChecking(false);
      }
    };

    run();
  }, [isLoading, router, session?.user?.id]);

  if (isLoading) {
    return <p className="text-sm text-muted">로그인 상태를 확인하는 중입니다...</p>;
  }

  if (!session) {
    return <p className="text-sm text-muted">로그인이 필요한 페이지입니다. 홈으로 이동합니다...</p>;
  }

  if (isPolicyChecking || !isPolicyAgreed) {
    return <p className="text-sm text-muted">최신 정책 동의 여부를 확인하는 중입니다...</p>;
  }

  return <>{children}</>;
}
