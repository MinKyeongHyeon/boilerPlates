import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type PolicyType = "terms" | "privacy";

type PolicyVersion = {
  type: PolicyType;
  version: string;
  title: string;
  effectiveAt: string;
};

type PolicyConsent = {
  userId: string;
  policyType: PolicyType;
  policyVersion: string;
  consentedAt: string;
};

const versions: PolicyVersion[] = [
  { type: "terms", version: "v1.0.0", title: "이용약관", effectiveAt: "2026-04-08T00:00:00.000Z" },
  { type: "privacy", version: "v1.0.0", title: "개인정보처리방침", effectiveAt: "2026-04-08T00:00:00.000Z" },
];

const consentFile = join(process.cwd(), ".data", "policy-consents.json");

export function getPolicyVersions() {
  return versions;
}

export function getLatestPolicyVersion(type: PolicyType) {
  const candidates = versions.filter((v) => v.type === type);
  return candidates[candidates.length - 1] ?? null;
}

async function ensureFile() {
  await mkdir(join(process.cwd(), ".data"), { recursive: true });
  try {
    await readFile(consentFile, "utf8");
  } catch {
    await writeFile(consentFile, JSON.stringify([]), "utf8");
  }
}

async function readConsents() {
  await ensureFile();
  const content = await readFile(consentFile, "utf8");
  return JSON.parse(content) as PolicyConsent[];
}

async function writeConsents(consents: PolicyConsent[]) {
  await ensureFile();
  await writeFile(consentFile, JSON.stringify(consents, null, 2), "utf8");
}

export async function savePolicyConsent(input: { userId: string; policyType: PolicyType; policyVersion: string }) {
  const consents = await readConsents();
  const withoutSame = consents.filter(
    (c) => !(c.userId === input.userId && c.policyType === input.policyType && c.policyVersion === input.policyVersion),
  );
  const next: PolicyConsent = {
    userId: input.userId,
    policyType: input.policyType,
    policyVersion: input.policyVersion,
    consentedAt: new Date().toISOString(),
  };
  withoutSame.push(next);
  await writeConsents(withoutSame);
  return next;
}

export async function getUserLatestConsents(userId: string) {
  const consents = await readConsents();
  const userConsents = consents.filter((c) => c.userId === userId);
  const terms = userConsents.filter((c) => c.policyType === "terms").at(-1) ?? null;
  const privacy = userConsents.filter((c) => c.policyType === "privacy").at(-1) ?? null;
  return { terms, privacy };
}
