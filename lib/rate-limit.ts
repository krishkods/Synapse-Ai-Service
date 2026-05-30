import UsageCounter from "@/models/UsageCounter";
import { PlanConfig } from "@/lib/plan-config";

type WindowKind = "minute" | "day" | "month" | "lifetime";
type MetricKind =
  | "requests"
  | "add_requests"
  | "retrieval_requests"
  | "active_memories";

type WindowResult = {
  count: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
  window: WindowKind;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function buildWindow(now: Date, window: WindowKind) {
  if (window === "minute") {
    const start = new Date(now);
    start.setSeconds(0, 0);

    const resetAt = new Date(start);
    resetAt.setMinutes(resetAt.getMinutes() + 1);

    return {
      windowKey: [
        start.getUTCFullYear(),
        pad(start.getUTCMonth() + 1),
        pad(start.getUTCDate()),
        pad(start.getUTCHours()),
        pad(start.getUTCMinutes()),
      ].join(""),
      expiresAt: new Date(resetAt.getTime() + 60000),
      resetAt,
    };
  }

  if (window === "day") {
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);

    const resetAt = new Date(start);
    resetAt.setUTCDate(resetAt.getUTCDate() + 1);

    return {
      windowKey: [
        start.getUTCFullYear(),
        pad(start.getUTCMonth() + 1),
        pad(start.getUTCDate()),
      ].join(""),
      expiresAt: new Date(resetAt.getTime() + 3600000),
      resetAt,
    };
  }

  if (window === "month") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    return {
      windowKey: [start.getUTCFullYear(), pad(start.getUTCMonth() + 1)].join(""),
      expiresAt: new Date(resetAt.getTime() + 86400000),
      resetAt,
    };
  }

  return {
    windowKey: "lifetime",
    expiresAt: null,
    resetAt: null,
  };
}

async function upsertCounter(params: {
  ownerId: string;
  apiKeyId?: string | null;
  plan: string;
  metric: MetricKind;
  window: WindowKind;
  namespace?: string | null;
  amount: number;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const windowMeta = buildWindow(now, params.window);

  const counter = await UsageCounter.findOneAndUpdate(
    {
      ownerId: params.ownerId,
      metric: params.metric,
      window: params.window,
      windowKey: windowMeta.windowKey,
      namespace: params.namespace ?? null,
    },
    {
      $inc: { count: params.amount },
      $setOnInsert: {
        apiKeyId: params.apiKeyId ?? null,
        plan: params.plan,
        expiresAt: windowMeta.expiresAt,
      },
      $set: {
        apiKeyId: params.apiKeyId ?? null,
        plan: params.plan,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  if ((counter.count ?? 0) < 0) {
    counter.count = 0;
    await counter.save();
  }

  return counter;
}

async function readCounter(params: {
  ownerId: string;
  metric: MetricKind;
  window: WindowKind;
  namespace?: string | null;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const windowMeta = buildWindow(now, params.window);

  const counter = await UsageCounter.findOne({
    ownerId: params.ownerId,
    metric: params.metric,
    window: params.window,
    windowKey: windowMeta.windowKey,
    namespace: params.namespace ?? null,
  });

  return {
    count: counter?.count ?? 0,
    resetAt: windowMeta.resetAt,
  };
}

export async function enforceRateLimit(params: {
  ownerId: string;
  apiKeyId: string;
  plan: PlanConfig;
}) {
  const now = new Date();
  const minuteCounter = await upsertCounter({
    ownerId: params.ownerId,
    apiKeyId: params.apiKeyId,
    plan: params.plan.name,
    metric: "requests",
    window: "minute",
    amount: 1,
    now,
  });
  const dayCounter = await upsertCounter({
    ownerId: params.ownerId,
    apiKeyId: params.apiKeyId,
    plan: params.plan.name,
    metric: "requests",
    window: "day",
    amount: 1,
    now,
  });

  const minute: WindowResult = {
    count: minuteCounter.count ?? 0,
    limit: params.plan.rateLimitPerMinute,
    remaining: Math.max(params.plan.rateLimitPerMinute - (minuteCounter.count ?? 0), 0),
    resetAt: buildWindow(now, "minute").resetAt,
    window: "minute",
  };
  const day: WindowResult = {
    count: dayCounter.count ?? 0,
    limit: params.plan.rateLimitPerDay,
    remaining: Math.max(params.plan.rateLimitPerDay - (dayCounter.count ?? 0), 0),
    resetAt: buildWindow(now, "day").resetAt,
    window: "day",
  };

  const exceeded = minute.count > minute.limit ? minute : day.count > day.limit ? day : null;

  return {
    exceeded,
    minute,
    day,
  };
}

export async function incrementMonthlyMetric(params: {
  ownerId: string;
  apiKeyId: string;
  plan: PlanConfig;
  metric: "add_requests" | "retrieval_requests";
  amount?: number;
}) {
  return upsertCounter({
    ownerId: params.ownerId,
    apiKeyId: params.apiKeyId,
    plan: params.plan.name,
    metric: params.metric,
    window: "month",
    amount: params.amount ?? 1,
  });
}

export async function adjustActiveMemoryCount(params: {
  ownerId: string;
  apiKeyId: string;
  plan: PlanConfig;
  amount: number;
}) {
  return upsertCounter({
    ownerId: params.ownerId,
    apiKeyId: params.apiKeyId,
    plan: params.plan.name,
    metric: "active_memories",
    window: "lifetime",
    amount: params.amount,
  });
}

export async function getCurrentUsage(ownerId: string, plan: PlanConfig) {
  const now = new Date();
  const [minuteCounter, dayCounter, monthlyAdds, monthlyRetrievals, activeMemories] =
    await Promise.all([
      readCounter({ ownerId, metric: "requests", window: "minute", now }),
      readCounter({ ownerId, metric: "requests", window: "day", now }),
      readCounter({ ownerId, metric: "add_requests", window: "month", now }),
      readCounter({ ownerId, metric: "retrieval_requests", window: "month", now }),
      readCounter({ ownerId, metric: "active_memories", window: "lifetime", now }),
    ]);

  return {
    minute: {
      limit: plan.rateLimitPerMinute,
      count: minuteCounter.count,
      remaining: Math.max(plan.rateLimitPerMinute - minuteCounter.count, 0),
      resetAt: minuteCounter.resetAt,
    },
    day: {
      limit: plan.rateLimitPerDay,
      count: dayCounter.count,
      remaining: Math.max(plan.rateLimitPerDay - dayCounter.count, 0),
      resetAt: dayCounter.resetAt,
    },
    monthly: {
      addRequests: {
        limit: plan.monthlyAddRequests,
        count: monthlyAdds.count,
        remaining:
          plan.monthlyAddRequests === null
            ? null
            : Math.max(plan.monthlyAddRequests - monthlyAdds.count, 0),
        resetAt: monthlyAdds.resetAt,
      },
      retrievalRequests: {
        limit: plan.monthlyRetrievalRequests,
        count: monthlyRetrievals.count,
        remaining:
          plan.monthlyRetrievalRequests === null
            ? null
            : Math.max(plan.monthlyRetrievalRequests - monthlyRetrievals.count, 0),
        resetAt: monthlyRetrievals.resetAt,
      },
    },
    activeMemories: {
      limit: plan.maxActiveMemories,
      count: activeMemories.count,
      remaining:
        plan.maxActiveMemories === null
          ? null
          : Math.max(plan.maxActiveMemories - activeMemories.count, 0),
    },
  };
}
