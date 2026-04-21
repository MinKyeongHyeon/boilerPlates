"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/?needsLogin=1");
    }
  }, [isLoading, router, session]);

  if (isLoading) {
    return <p className="text-sm text-muted">로그인 상태를 확인하는 중입니다...</p>;
  }

  if (!session) {
    return <p className="text-sm text-muted">로그인이 필요한 페이지입니다. 홈으로 이동합니다...</p>;
  }

  return <>{children}</>;
}
