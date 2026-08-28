export type SubscriptionPlan = "free" | "pro" | "business";
export const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export interface EffectiveSubscription {
  effectivePlan: SubscriptionPlan;
  isActive: boolean;
  daysRemaining: number;
  expiresAt: Date | null;
}

export type SubscriptionFeature =
  | "basicEditor"
  | "cloudSavedDesigns"
  | "pngExport"
  | "unlimitedDesigns"
  | "advancedEditingTools"
  | "premiumAIFeatures"
  | "brandKit"
  | "teamWorkspace"
  | "prioritySupport";

export const PLAN_FEATURES: Record<SubscriptionPlan, readonly SubscriptionFeature[]> = {
  free: ["basicEditor", "cloudSavedDesigns", "pngExport"],
  pro: [
    "basicEditor",
    "cloudSavedDesigns",
    "pngExport",
    "unlimitedDesigns",
    "advancedEditingTools",
    "premiumAIFeatures",
    "brandKit",
  ],
  business: [
    "basicEditor",
    "cloudSavedDesigns",
    "pngExport",
    "unlimitedDesigns",
    "advancedEditingTools",
    "premiumAIFeatures",
    "brandKit",
    "teamWorkspace",
    "prioritySupport",
  ],
};

export const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

export function normalizeSubscriptionPlan(value: unknown): SubscriptionPlan {
  if (typeof value !== "string") return "free";

  switch (value.trim().toLowerCase()) {
    case "business":
    case "enterprise":
      return "business";
    case "pro":
    case "premium":
      return "pro";
    case "free":
    case "basic":
    default:
      return "free";
  }
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && value !== null) {
    const timestamp = value as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
    if (typeof timestamp.toDate === "function") return toDate(timestamp.toDate());
    if (typeof timestamp.seconds === "number") {
      return new Date(timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1e6));
    }
  }
  return null;
}

export function getEffectiveSubscription(
  subscription: { subscriptionPlan?: unknown; subscriptionStatus?: unknown; subscriptionExpiresAt?: unknown; subscriptionEndDate?: unknown; subscriptionStartedAt?: unknown; subscriptionStartDate?: unknown },
  now: Date = new Date()
): EffectiveSubscription {
  const storedPlan = normalizeSubscriptionPlan(subscription.subscriptionPlan);
  const startedAt = toDate(subscription.subscriptionStartedAt ?? subscription.subscriptionStartDate);
  const expiresAt =
    toDate(subscription.subscriptionExpiresAt ?? subscription.subscriptionEndDate) ||
    (startedAt ? new Date(startedAt.getTime() + SUBSCRIPTION_PERIOD_MS) : null);
  const hasValidExpiry = expiresAt !== null && expiresAt.getTime() > now.getTime();
  const isActive =
    storedPlan !== "free" &&
    subscription.subscriptionStatus === "active" &&
    hasValidExpiry;

  if (!isActive) {
    return { effectivePlan: "free", isActive: false, daysRemaining: 0, expiresAt };
  }

  return {
    effectivePlan: storedPlan,
    isActive: true,
    daysRemaining: Math.max(1, Math.ceil((expiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))),
    expiresAt,
  };
}

export function hasFeature(
  plan: SubscriptionPlan,
  feature: SubscriptionFeature
): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

export function canUpgradeTo(
  currentPlan: SubscriptionPlan,
  targetPlan: SubscriptionPlan
): boolean {
  return PLAN_RANK[targetPlan] > PLAN_RANK[currentPlan];
}

export function getRequiredPlan(feature: SubscriptionFeature): Exclude<SubscriptionPlan, "free"> {
  if (PLAN_FEATURES.pro.includes(feature)) return "pro";
  return "business";
}

export function getTemplateLimit(plan: SubscriptionPlan): number {
  if (plan === "business") return Number.POSITIVE_INFINITY;
  if (plan === "pro") return 24;
  return 8;
}
