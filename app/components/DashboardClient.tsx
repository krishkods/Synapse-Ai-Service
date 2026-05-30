'use client';

import DashboardClientNew from './DashboardClientNew';

type DashboardClientProps = {
  userId: string;
  userName: string;
};

export default function DashboardClient({
  userId,
  userName,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-[#fff8ea]">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/30 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      {/* Main Workspace */}
      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Runtime Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-yellow-200/40 bg-white/70 px-6 py-4 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-sm">
              <span className="text-2xl font-bold text-[#3b3210]">
                S
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#2b2418]">
                Synapse Cognitive Workspace
              </h1>

              <p className="text-sm text-[#6b604f]">
                Persistent semantic memory &
                cognitive retrieval runtime
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              Runtime Online
            </div>

            <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-[#5f5545]">
              User: {userName}
            </div>

            <div className="rounded-full border border-yellow-200 bg-white px-4 py-2 text-sm font-medium text-[#5f5545]">
              ID: {userId.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Cognitive Workspace */}
        <DashboardClientNew
          userId={userId}
          userName={userName}
        />
      </div>
    </div>
  );
}