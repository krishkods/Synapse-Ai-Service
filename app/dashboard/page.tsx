import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import DashboardClient from "../components/DashboardClient";
import SignOutButton from "../components/SignOutButton";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("synapse_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(payload.userId).select("name email createdAt");
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">🧠 Synapse Dashboard</h1>
              <p className="text-slate-400 mt-2">Manage memories, query the AI service, and personalize your experience.</p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-800/50 bg-slate-950/50 p-6">
            <div className="flex flex-col gap-1 text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Signed in as</p>
                <p className="mt-2 text-xl font-semibold text-white">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              <p className="text-sm text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Client-side Dashboard Content */}
        <DashboardClient userId={user._id.toString()} userName={user.name} />
      </div>
    </main>
  );
}
