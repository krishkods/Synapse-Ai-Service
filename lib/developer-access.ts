import ApiKey from "@/models/ApiKey";
import { Types } from "mongoose";
import dbConnect from "@/lib/mongoose";
import { extractApiKey, hashApiKey } from "@/lib/api-keys";
import { getPlanConfig } from "@/lib/plan-config";
import {
  adjustActiveMemoryCount,
  enforceRateLimit,
  getCurrentUsage,
  incrementMonthlyMetric,
} from "@/lib/rate-limit";

export class DeveloperAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function authenticateApiKey(request: Request) {
  const rawKey = extractApiKey(request);

  if (!rawKey) {
    throw new DeveloperAccessError("Missing API key", 401);
  }

  await dbConnect();

  const keyHash = hashApiKey(rawKey);
  const apiKey = await ApiKey.findOne({
    keyHash,
    isActive: true,
    revokedAt: null,
  }).populate("userId", "plan email name");

  if (!apiKey || !apiKey.userId) {
    throw new DeveloperAccessError("Invalid API key", 401);
  }

  const owner = apiKey.userId as unknown as {
    _id: { toString(): string };
    plan?: string;
    email: string;
    name: string;
  };

  const plan = getPlanConfig(owner.plan);
  const rate = await enforceRateLimit({
    ownerId: owner._id.toString(),
    apiKeyId: apiKey._id.toString(),
    plan,
  });

  if (rate.exceeded) {
    throw new DeveloperAccessError(
      `Rate limit exceeded for ${rate.exceeded.window} window`,
      429
    );
  }

  apiKey.lastUsedAt = new Date();
  await apiKey.save();

  return {
    apiKey,
    owner,
    plan,
    rate,
  };
}

export async function enforceDeveloperUsage(params: {
  ownerId: string;
  apiKeyId: string;
  planName?: string | null;
  operation: "ingest" | "retrieve" | "update" | "delete";
}) {
  await dbConnect();

  const plan = getPlanConfig(params.planName);
  const usage = await getCurrentUsage(params.ownerId, plan);

  if (
    params.operation === "ingest" &&
    plan.maxActiveMemories !== null &&
    usage.activeMemories.count >= plan.maxActiveMemories
  ) {
    throw new DeveloperAccessError(
      `Active memory limit reached for ${plan.label}. Archive, delete, or upgrade before ingesting more memories.`,
      403
    );
  }

  if (params.operation === "ingest" && plan.monthlyAddRequests !== null) {
    if (usage.monthly.addRequests.count >= plan.monthlyAddRequests) {
      throw new DeveloperAccessError(
        `Monthly add request quota reached for ${plan.label}.`,
        429
      );
    }

    await incrementMonthlyMetric({
      ownerId: params.ownerId,
      apiKeyId: params.apiKeyId,
      plan,
      metric: "add_requests",
    });
  }

  if (params.operation === "retrieve" && plan.monthlyRetrievalRequests !== null) {
    if (usage.monthly.retrievalRequests.count >= plan.monthlyRetrievalRequests) {
      throw new DeveloperAccessError(
        `Monthly retrieval request quota reached for ${plan.label}.`,
        429
      );
    }

    await incrementMonthlyMetric({
      ownerId: params.ownerId,
      apiKeyId: params.apiKeyId,
      plan,
      metric: "retrieval_requests",
    });
  }
}

export async function reconcileDeveloperUsage(params: {
  ownerId: string;
  apiKeyId: string;
  planName?: string | null;
  operation: "ingest" | "retrieve" | "update" | "delete";
  responseBody: unknown;
  responseStatus: number;
}) {
  if (params.responseStatus < 200 || params.responseStatus >= 300) {
    return;
  }

  const plan = getPlanConfig(params.planName);

  if (params.operation === "ingest") {
    const savedCount =
      typeof params.responseBody === "object" &&
      params.responseBody &&
      "saved_count" in params.responseBody &&
      typeof (params.responseBody as { saved_count?: unknown }).saved_count === "number"
        ? (params.responseBody as { saved_count: number }).saved_count
        : 0;

    if (savedCount > 0) {
      await adjustActiveMemoryCount({
        ownerId: params.ownerId,
        apiKeyId: params.apiKeyId,
        plan,
        amount: savedCount,
      });
    }
  }

  if (params.operation === "delete") {
    const deleted =
      typeof params.responseBody === "object" &&
      params.responseBody &&
      "deleted" in params.responseBody &&
      (params.responseBody as { deleted?: unknown }).deleted === true;

    if (deleted) {
      await adjustActiveMemoryCount({
        ownerId: params.ownerId,
        apiKeyId: params.apiKeyId,
        plan,
        amount: -1,
      });
    }
  }
}

export async function getDeveloperUsage(ownerId: string, planName?: string | null) {
  await dbConnect();
  const plan = getPlanConfig(planName);
  const usage = await getCurrentUsage(ownerId, plan);
  const projectCount = (
    await ApiKey.distinct("namespace", {
      userId: new Types.ObjectId(ownerId),
      isActive: true,
      revokedAt: null,
    })
  ).length;

  return {
    plan,
    usage,
    projectCount,
  };
}
