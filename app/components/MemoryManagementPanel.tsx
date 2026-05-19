'use client';

import { useState } from "react";

type MemoryStats = {
  total_memories: number;
  episodic_memories: number;
  semantic_memories: number;
  compressed_memories: number;
  average_importance: number;
};

type MemoryClusters = {
  cluster_count: number;
  clusters: Record<string, string[]>;
};

export default function MemoryManagementPanel({ userId }: { userId: string }) {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [clusters, setClusters] = useState<MemoryClusters | null>(null);
  const [log, setLog] = useState<string>("");

  async function loadStats() {
    setLog("Loading memory stats...");
    const response = await fetch(`/api/ai/memory/stats?user_id=${encodeURIComponent(userId)}`);
    const data = await response.json();
    if (response.ok) {
      setStats(data);
      setLog("Memory stats loaded.");
    } else {
      setLog(data.error || "Unable to load memory stats.");
    }
  }

  async function loadClusters() {
    setLog("Loading memory clusters...");
    const response = await fetch(`/api/ai/memory/clusters?user_id=${encodeURIComponent(userId)}`);
    const data = await response.json();
    if (response.ok) {
      setClusters(data);
      setLog("Memory clusters loaded.");
    } else {
      setLog(data.error || "Unable to load clusters.");
    }
  }

  async function compressMemory() {
    setLog("Requesting compression...");
    const response = await fetch("/api/ai/memory/compress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await response.json();
    if (response.ok) {
      setLog(`Compressed ${data.compressed_count} memories.`);
      await loadStats();
    } else {
      setLog(data.error || "Compression failed.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Memory management</h2>
          <p className="mt-2 text-slate-400">
            Sync memory analytics with your Synapse AI backend and manage long-term memory intelligently.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadStats}
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Load stats
          </button>
          <button
            type="button"
            onClick={loadClusters}
            className="rounded-full border border-slate-700/70 px-5 py-2 text-sm text-slate-200 hover:border-cyan-300"
          >
            Load clusters
          </button>
          <button
            type="button"
            onClick={compressMemory}
            className="rounded-full bg-slate-800 px-5 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Compress memories
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
          <h3 className="text-lg font-semibold text-white">Memory stats</h3>
          {stats ? (
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>Total memories: {stats.total_memories}</li>
              <li>Episodic: {stats.episodic_memories}</li>
              <li>Semantic: {stats.semantic_memories}</li>
              <li>Compressed: {stats.compressed_memories}</li>
              <li>Average importance: {stats.average_importance.toFixed(2)}</li>
            </ul>
          ) : (
            <p className="mt-4 text-slate-400">Click load stats to view memory metrics.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6">
          <h3 className="text-lg font-semibold text-white">Memory clusters</h3>
          {clusters ? (
            <div className="mt-4 space-y-3 text-slate-300">
              <p className="text-sm text-slate-400">Cluster count: {clusters.cluster_count}</p>
              <ul className="list-disc space-y-2 pl-5">
                {Object.entries(clusters.clusters).map(([name, ids]) => (
                  <li key={name}>
                    <span className="font-medium text-white">{name}</span>: {ids.length} memories
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-slate-400">Click load clusters to view grouped memory insights.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-4 text-sm text-slate-300">
        <p>{log || "No actions taken yet."}</p>
      </div>
    </section>
  );
}
