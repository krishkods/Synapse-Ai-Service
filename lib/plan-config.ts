export type PlanName =
  | "hobby"
  | "pro"
  | "growth"
  | "scale"
  | "enterprise";

export type BillingInterval = "month" | "custom";

export type PlanConfig = {
  name: PlanName;
  label: string;
  priceLabel: string;
  billingInterval: BillingInterval;
  bestFor: string;
  maxApiKeys: number;
  maxProjects: number | null;
  maxTeamMembers: number | null;
  maxActiveMemories: number | null;
  monthlyAddRequests: number | null;
  monthlyRetrievalRequests: number | null;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  semanticSearch: string;
  memoryTagging: boolean;
  metadataFiltering: boolean;
  webhooks: boolean;
  analyticsDashboard: string;
  exportApis: boolean;
  realtimeMemorySync: boolean;
  agentMemoryApis: string;
  memoryTimelines: boolean;
  relationshipGraphs: boolean;
  priorityIndexing: boolean;
  dedicatedResources: string;
  sla: string;
  complianceSupport: string;
  ssoSaml: boolean;
  selfHosting: string;
  support: string;
};

export const EARLY_ROLLOUT_NOTICE =
  "Synapse pricing and usage limits are part of an early-stage rollout and may evolve as infrastructure, developer feedback, and platform capabilities mature. Early adopters will benefit from expanded limits, rollout perks, and platform improvements whenever sustainably possible.";

export const OVERAGE_PRICING = [
  {
    label: "Additional 10K active memories",
    price: "$3",
  },
  {
    label: "Additional 100K add requests",
    price: "$4",
  },
  {
    label: "Additional 100K retrieval requests",
    price: "$5",
  },
  {
    label: "Additional team member",
    price: "$5/user",
  },
  {
    label: "Additional project",
    price: "$5/project",
  },
] as const;

export const PLAN_ORDER: PlanName[] = [
  "hobby",
  "pro",
  "growth",
  "scale",
  "enterprise",
];

export const PLAN_CONFIGS: Record<PlanName, PlanConfig> = {
  hobby: {
    name: "hobby",
    label: "Hobby",
    priceLabel: "Free",
    billingInterval: "month",
    bestFor: "Experiments",
    maxApiKeys: 1,
    maxProjects: 1,
    maxTeamMembers: 1,
    maxActiveMemories: 15000,
    monthlyAddRequests: 10000,
    monthlyRetrievalRequests: 10000,
    rateLimitPerMinute: 30,
    rateLimitPerDay: 1000,
    semanticSearch: "Basic",
    memoryTagging: false,
    metadataFiltering: false,
    webhooks: false,
    analyticsDashboard: "No",
    exportApis: false,
    realtimeMemorySync: false,
    agentMemoryApis: "No",
    memoryTimelines: false,
    relationshipGraphs: false,
    priorityIndexing: false,
    dedicatedResources: "No",
    sla: "No",
    complianceSupport: "No",
    ssoSaml: false,
    selfHosting: "No",
    support: "Community",
  },
  pro: {
    name: "pro",
    label: "Pro",
    priceLabel: "$17/mo",
    billingInterval: "month",
    bestFor: "Indie Devs",
    maxApiKeys: 3,
    maxProjects: 3,
    maxTeamMembers: 3,
    maxActiveMemories: 150000,
    monthlyAddRequests: 75000,
    monthlyRetrievalRequests: 100000,
    rateLimitPerMinute: 120,
    rateLimitPerDay: 10000,
    semanticSearch: "Advanced",
    memoryTagging: true,
    metadataFiltering: true,
    webhooks: true,
    analyticsDashboard: "Basic",
    exportApis: true,
    realtimeMemorySync: false,
    agentMemoryApis: "No",
    memoryTimelines: false,
    relationshipGraphs: false,
    priorityIndexing: false,
    dedicatedResources: "No",
    sla: "No",
    complianceSupport: "No",
    ssoSaml: false,
    selfHosting: "No",
    support: "Community",
  },
  growth: {
    name: "growth",
    label: "Growth",
    priceLabel: "$79/mo",
    billingInterval: "month",
    bestFor: "Startups",
    maxApiKeys: 8,
    maxProjects: 5,
    maxTeamMembers: 10,
    maxActiveMemories: 750000,
    monthlyAddRequests: 300000,
    monthlyRetrievalRequests: 500000,
    rateLimitPerMinute: 400,
    rateLimitPerDay: 50000,
    semanticSearch: "Advanced",
    memoryTagging: true,
    metadataFiltering: true,
    webhooks: true,
    analyticsDashboard: "Advanced",
    exportApis: true,
    realtimeMemorySync: true,
    agentMemoryApis: "Basic",
    memoryTimelines: true,
    relationshipGraphs: true,
    priorityIndexing: true,
    dedicatedResources: "No",
    sla: "No",
    complianceSupport: "No",
    ssoSaml: false,
    selfHosting: "No",
    support: "Email",
  },
  scale: {
    name: "scale",
    label: "Scale",
    priceLabel: "$249/mo",
    billingInterval: "month",
    bestFor: "Scaling AI Apps",
    maxApiKeys: 20,
    maxProjects: null,
    maxTeamMembers: null,
    maxActiveMemories: 2000000,
    monthlyAddRequests: 1500000,
    monthlyRetrievalRequests: 1500000,
    rateLimitPerMinute: 1200,
    rateLimitPerDay: 200000,
    semanticSearch: "Advanced",
    memoryTagging: true,
    metadataFiltering: true,
    webhooks: true,
    analyticsDashboard: "Advanced",
    exportApis: true,
    realtimeMemorySync: true,
    agentMemoryApis: "Advanced",
    memoryTimelines: true,
    relationshipGraphs: true,
    priorityIndexing: true,
    dedicatedResources: "Shared Premium",
    sla: "Basic",
    complianceSupport: "Limited",
    ssoSaml: false,
    selfHosting: "Optional",
    support: "Priority",
  },
  enterprise: {
    name: "enterprise",
    label: "Enterprise",
    priceLabel: "Custom",
    billingInterval: "custom",
    bestFor: "Large Organizations",
    maxApiKeys: 50,
    maxProjects: null,
    maxTeamMembers: null,
    maxActiveMemories: null,
    monthlyAddRequests: null,
    monthlyRetrievalRequests: null,
    rateLimitPerMinute: 3000,
    rateLimitPerDay: 1000000,
    semanticSearch: "Enterprise",
    memoryTagging: true,
    metadataFiltering: true,
    webhooks: true,
    analyticsDashboard: "Custom",
    exportApis: true,
    realtimeMemorySync: true,
    agentMemoryApis: "Enterprise",
    memoryTimelines: true,
    relationshipGraphs: true,
    priorityIndexing: true,
    dedicatedResources: "Dedicated",
    sla: "Custom",
    complianceSupport: "Full",
    ssoSaml: true,
    selfHosting: "Yes",
    support: "Dedicated Slack + SLA",
  },
};

export function normalizePlanName(plan?: string | null): PlanName {
  switch (plan) {
    case "free":
      return "hobby";
    case "pro":
    case "growth":
    case "scale":
    case "enterprise":
    case "hobby":
      return plan;
    default:
      return "hobby";
  }
}

export function getPlanConfig(plan?: string | null): PlanConfig {
  return PLAN_CONFIGS[normalizePlanName(plan)];
}

export function formatPlanLimit(value: number | null) {
  if (value === null) {
    return "Custom";
  }

  return value.toLocaleString();
}
