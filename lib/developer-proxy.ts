import { NextResponse } from "next/server";

import {
  authenticateApiKey,
  DeveloperAccessError,
  enforceDeveloperUsage,
  reconcileDeveloperUsage,
} from "@/lib/developer-access";

const AI_SERVICE_URL =
  process.env.SYNAPSE_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "http://localhost:8000";

const AI_PROXY_SECRET =
  process.env.SYNAPSE_AI_PROXY_SECRET || "";

const REQUEST_TIMEOUT_MS = 20000;

function extractBodyNamespace(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const namespace = (body as { namespace?: unknown }).namespace;
  return typeof namespace === "string" ? namespace.trim() : null;
}

function buildRateHeaders(rate: Awaited<ReturnType<typeof authenticateApiKey>>["rate"]) {
  return {
    "X-RateLimit-Limit-Minute": String(rate.minute.limit),
    "X-RateLimit-Remaining-Minute": String(rate.minute.remaining),
    "X-RateLimit-Reset-Minute": rate.minute.resetAt.toISOString(),
    "X-RateLimit-Limit-Day": String(rate.day.limit),
    "X-RateLimit-Remaining-Day": String(rate.day.remaining),
    "X-RateLimit-Reset-Day": rate.day.resetAt.toISOString(),
  };
}

function buildUsageHeaders(access: Awaited<ReturnType<typeof authenticateApiKey>>) {
  return {
    ...buildRateHeaders(access.rate),
    "X-Synapse-Plan": access.plan.name,
  };
}

export async function proxyDeveloperRequest(params: {
  request: Request;
  path: string;
  method: "POST" | "PUT" | "DELETE";
  operation: "ingest" | "retrieve" | "update" | "delete";
  body?: unknown;
}) {
  try {
    if (!AI_PROXY_SECRET) {
      return NextResponse.json(
        { error: "SYNAPSE_AI_PROXY_SECRET is not configured" },
        { status: 500 }
      );
    }

    const access = await authenticateApiKey(params.request);
    await enforceDeveloperUsage({
      ownerId: access.owner._id.toString(),
      apiKeyId: access.apiKey._id.toString(),
      planName: access.owner.plan,
      operation: params.operation,
    });

    const requestNamespace = extractBodyNamespace(params.body);

    if (!requestNamespace) {
      return NextResponse.json(
        { error: "namespace is required" },
        { status: 400, headers: buildUsageHeaders(access) }
      );
    }

    if (requestNamespace !== access.apiKey.namespace) {
      return NextResponse.json(
        {
          error: `API key is restricted to namespace ${access.apiKey.namespace}`,
        },
        { status: 403, headers: buildUsageHeaders(access) }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${AI_SERVICE_URL}${params.path}`, {
        method: params.method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Synapse-Proxy-Secret": AI_PROXY_SECRET,
          "X-Synapse-Plan": access.plan.name,
          "X-Synapse-Key-Prefix": access.apiKey.prefix,
        },
        body: params.body === undefined ? undefined : JSON.stringify(params.body),
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let data: unknown;

      try {
        data = await response.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid response from Synapse AI service" },
          { status: 502, headers: buildUsageHeaders(access) }
        );
      }

      await reconcileDeveloperUsage({
        ownerId: access.owner._id.toString(),
        apiKeyId: access.apiKey._id.toString(),
        planName: access.owner.plan,
        operation: params.operation,
        responseBody: data,
        responseStatus: response.status,
      });

      return NextResponse.json(data, {
        status: response.status,
        headers: buildUsageHeaders(access),
      });
    } catch (error: unknown) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { error: "Developer request timed out" },
          { status: 504, headers: buildUsageHeaders(access) }
        );
      }

      throw error;
    }
  } catch (error: unknown) {
    if (error instanceof DeveloperAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Developer proxy failed" },
      { status: 500 }
    );
  }
}
