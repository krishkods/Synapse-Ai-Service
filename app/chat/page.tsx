import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import LLMChatPanel from "../components/LLMChatPanel";

export default async function ChatPage() {
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
              <h1 className="text-3xl font-semibold text-white">💬 Synapse Chat</h1>
              <p className="text-slate-400 mt-2">
                Converse with local retrieval or external LLMs directly from your Synapse workspace.
              </p>
            </div>
          </div>
        </div>

        <LLMChatPanel userName={user.name} />
      </div>
    </main>
  );
}
