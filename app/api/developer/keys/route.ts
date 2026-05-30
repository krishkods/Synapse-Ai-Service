import { NextResponse } from "next/server";
import { Types } from "mongoose";

import ApiKey from "@/models/ApiKey";
import { generateApiKey } from "@/lib/api-keys";
import { requireCurrentUser } from "@/lib/current-user";
import dbConnect from "@/lib/mongoose";
import { getPlanConfig } from "@/lib/plan-config";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizeNamespace(namespace: string) {
  return namespace.trim().toLowerCase();
}

function isValidNamespace(namespace: string) {
  return /^[a-z0-9][a-z0-9-]{1,95}$/.test(namespace);
}

export async function GET(request: Request) {
  const user = await requireCurrentUser(request);
  if (!user) {
    return unauthorized();
  }

  await dbConnect();

  const keys = await ApiKey.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("name prefix lastFour namespace isActive lastUsedAt revokedAt createdAt updatedAt");

  const plan = getPlanConfig(user.plan);

  return NextResponse.json({
    keys,
    plan,
  });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser(request);
  if (!user) {
    return unauthorized();
  }

  const body = (await request.json()) as {
    name?: string;
    namespace?: string;
  };

  const name = body.name?.trim();
  const namespace = normalizeNamespace(body.namespace ?? "");

  if (!name || !namespace) {
    return NextResponse.json(
      { error: "API key name and namespace are required" },
      { status: 400 }
    );
  }

  if (!isValidNamespace(namespace)) {
    return NextResponse.json(
      {
        error:
          "Namespace must be 2-96 characters and contain only lowercase letters, numbers, and hyphens.",
      },
      { status: 400 }
    );
  }

  await dbConnect();

  const plan = getPlanConfig(user.plan);
  const activeKeyCount = await ApiKey.countDocuments({
    userId: user._id,
    isActive: true,
    revokedAt: null,
  });
  const namespaces = await ApiKey.distinct("namespace", {
    userId: new Types.ObjectId(user._id.toString()),
    isActive: true,
    revokedAt: null,
  });
  const isNewProject = !namespaces.includes(namespace);

  if (activeKeyCount >= plan.maxApiKeys) {
    return NextResponse.json(
      {
        error: `Plan limit reached. ${plan.label} allows up to ${plan.maxApiKeys} active API keys.`,
      },
      { status: 403 }
    );
  }

  if (
    isNewProject &&
    plan.maxProjects !== null &&
    namespaces.length >= plan.maxProjects
  ) {
    return NextResponse.json(
      {
        error: `Plan limit reached. ${plan.label} allows up to ${plan.maxProjects} active projects (namespaces).`,
      },
      { status: 403 }
    );
  }

  const generated = generateApiKey();

  const created = await ApiKey.create({
    userId: user._id,
    name,
    namespace,
    prefix: generated.prefix,
    keyHash: generated.keyHash,
    lastFour: generated.lastFour,
    isActive: true,
  });

  return NextResponse.json(
    {
      success: true,
      apiKey: {
        id: created._id,
        name: created.name,
        namespace: created.namespace,
        prefix: created.prefix,
        lastFour: created.lastFour,
        createdAt: created.createdAt,
      },
      secret: generated.rawKey,
      plan,
    },
    { status: 201 }
  );
}
