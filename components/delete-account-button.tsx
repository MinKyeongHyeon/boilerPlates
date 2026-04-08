"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteAccount = async () => {
    const confirmText = window.prompt("계정을 삭제하려면 DELETE를 입력하세요.");
    if (!confirmText) return;

    setIsDeleting(true);
    try {
      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;
      if (!accessToken) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }

      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ confirmText }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "계정 삭제에 실패했습니다.");
        return;
      }

      await supabase.auth.signOut();
      alert("계정이 삭제되었습니다.");
      window.location.href = "/";
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600"
      type="button"
      onClick={onDeleteAccount}
      disabled={isDeleting}
    >
      {isDeleting ? "삭제 중..." : "계정 탈퇴"}
    </button>
  );
}
