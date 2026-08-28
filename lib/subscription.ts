export type SubscriptionPlan = "free" | "pro" | "business";

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
