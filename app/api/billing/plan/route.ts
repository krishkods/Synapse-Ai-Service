import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongoose";
import { getPlanConfig, normalizePlanName, PLAN_ORDER } from "@/lib/plan-config";
import { requireCurrentUser } from "@/lib/current-user";
import User from "@/models/User";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(request: Request) {
  const currentUser = await requireCurrentUser(request);
  if (!currentUser) {
    return unauthorized();
  }

  const body = (await request.json()) as { plan?: string };
  const requestedPlan = body.plan?.trim();

  if (!requestedPlan || !PLAN_ORDER.includes(normalizePlanName(requestedPlan))) {
    return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(currentUser._id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.plan = normalizePlanName(requestedPlan);
  user.planUpdatedAt = new Date();
  await user.save();

  const plan = getPlanConfig(user.plan);

  return NextResponse.json({
    success: true,
    message: `${plan.label} plan is now active for your account.`,
    plan,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      planUpdatedAt: user.planUpdatedAt,
    },
  });
}
