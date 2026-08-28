import { randomUUID } from "crypto";

function getEnvironmentValue(name: string): string {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "") || "";
}

export type PaidPlanId = "pro" | "business";

export interface PaidPlan {
  id: PaidPlanId;
  name: string;
  amount: number;
  currency: "INR";
}

export const PAID_PLANS: Record<PaidPlanId, PaidPlan> = {
  pro: { id: "pro", name: "Pro", amount: 5, currency: "INR" },
  business: { id: "business", name: "Business", amount: 999, currency: "INR" },
};

export function getCashfreeEnvironment(): "sandbox" | "production" {
  const environment = getEnvironmentValue("CASHFREE_ENVIRONMENT");
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("CASHFREE_ENVIRONMENT must be sandbox or production.");
  }
  return environment;
}

export function getCashfreeBaseUrl(): string {
  return getCashfreeEnvironment() === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";
}

export function getCashfreeHeaders(): HeadersInit {
  const appId = getEnvironmentValue("CASHFREE_APP_ID");
  const secretKey = getEnvironmentValue("CASHFREE_SECRET_KEY");
  if (!appId || !secretKey) {
    throw new Error("Cashfree server credentials are not configured.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-version": getEnvironmentValue("CASHFREE_API_VERSION") || "2023-08-01",
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
}

export function createCashfreeOrderId(userId: string): string {
  return `mca_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

export function normalizeCustomerPhone(value: unknown): string {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  return digits;
}

export function isValidCustomerPhone(phone: string): boolean {
  return /^[1-9]\d{9,14}$/.test(phone);
}
