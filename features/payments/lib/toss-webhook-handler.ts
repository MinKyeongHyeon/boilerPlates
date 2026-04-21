type TossWebhookPayload = {
  eventType?: string;
  eventId?: string;
  secret?: string;
  data?: {
    orderId?: string;
    status?: string;
  };
};

export async function processTossWebhook(payload: TossWebhookPayload) {
  // DEPOSIT_CALLBACK은 eventType 없이 secret/status/orderId 형태로 올 수 있음
  if (!payload.eventType && payload.secret) {
    return {
      handled: true,
      eventType: "DEPOSIT_CALLBACK",
      eventId: null,
    };
  }

  if (!payload.eventType) {
    throw new Error("eventType이 없는 웹훅은 처리할 수 없습니다.");
  }

  // 현재 단계에서는 처리 성공만 반환하고, 상세 상태 동기화는 WH-001/WH-002에서 확장.
  return {
    handled: true,
    eventType: payload.eventType,
    eventId: payload.eventId ?? null,
  };
}
