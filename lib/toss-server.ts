export function getTossSecretKey() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY 환경 변수가 비어 있습니다.");
  }
  return secretKey;
}

export function getTossAuthHeader(secretKey: string) {
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}
