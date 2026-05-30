'use client';

import { useMemo, useState } from 'react';

import {
  Activity,
  Brain,
  CheckCircle2,
  Database,
  Layers3,
  Loader2,
  MemoryStick,
  Network,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react';

type MemoryStats = {
  total_memories: number;
  episodic_memories: number;
  semantic_memories: number;
  compressed_memories: number;
  average_importance: number;
};

type MemoryClusters = {
  cluster_count: number;
  clusters: Record<
    string,
    string[]
  >;
};

type RuntimeState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

function getClusterColor(
  index: number
) {
  const colors = [
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-green-500',
  ];

  return (
    colors[
      index %
        colors.length
    ] ||
    colors[0]
  );
}

export default function MemoryManagementPanel({
  userId,
}: {
  userId: string;
}) {
  const [stats, setStats] =
    useState<MemoryStats | null>(
      null
    );

  const [
    clusters,
    setClusters,
  ] =
    useState<MemoryClusters | null>(
      null
    );

  const [runtimeLog, setRuntimeLog] =
    useState(
      'Cognitive runtime idle.'
    );

  const [state, setState] =
    useState<RuntimeState>(
      'idle'
    );

  const [
    activeOperation,
    setActiveOperation,
  ] = useState<
    string | null
  >(null);

  const clusterEntries =
    useMemo(() => {
      return Object.entries(
        clusters?.clusters ||
          {}
      );
    }, [clusters]);

  async function loadStats() {
    try {
      setState(
        'loading'
      );

      setActiveOperation(
        'Loading cognitive telemetry...'
      );

      setRuntimeLog(
        'Retrieving semantic memory telemetry.'
      );

      const response =
        await fetch(
          `/api/ai/memory/stats?user_id=${encodeURIComponent(
            userId
          )}`,
          {
            cache:
              'no-store',
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to load stats.'
        );
      }

      setStats(data);

      setRuntimeLog(
        'Cognitive telemetry loaded successfully.'
      );

      setState(
        'success'
      );
    } catch (
      err: unknown
    ) {
      setRuntimeLog(
        err instanceof Error
          ? err.message
          : 'Telemetry request failed.'
      );

      setState(
        'error'
      );
    } finally {
      setActiveOperation(
        null
      );
    }
  }

  async function loadClusters() {
    try {
      setState(
        'loading'
      );

      setActiveOperation(
        'Analyzing semantic topology...'
      );

      setRuntimeLog(
        'Generating cognitive cluster map.'
      );

      const response =
        await fetch(
          `/api/ai/memory/clusters?user_id=${encodeURIComponent(
            userId
          )}`,
          {
            cache:
              'no-store',
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to load clusters.'
        );
      }

      setClusters(data);

      setRuntimeLog(
        'Semantic memory clusters generated.'
      );

      setState(
        'success'
      );
    } catch (
      err: unknown
    ) {
      setRuntimeLog(
        err instanceof Error
          ? err.message
          : 'Cluster analysis failed.'
      );

      setState(
        'error'
      );
    } finally {
      setActiveOperation(
        null
      );
    }
  }

  async function compressMemory() {
    try {
      setState(
        'loading'
      );

      setActiveOperation(
        'Compressing semantic memory...'
      );

      setRuntimeLog(
        'Running memory compression runtime.'
      );

      const response =
        await fetch(
          '/api/ai/memory/compress',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              {
                user_id:
                  userId,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Compression failed.'
        );
      }

      setRuntimeLog(
        `Compressed ${
          data.compressed_count ||
          0
        } memories successfully.`
      );

      setState(
        'success'
      );

      await loadStats();
    } catch (
      err: unknown
    ) {
      setRuntimeLog(
        err instanceof Error
          ? err.message
          : 'Compression failed.'
      );

      setState(
        'error'
      );
    } finally {
      setActiveOperation(
        null
      );
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_20px_80px_rgba(255,210,90,0.15)] backdrop-blur-2xl">
      {/* HEADER */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold text-amber-800">
            <Brain className="h-4 w-4" />
            Cognitive Operations Runtime
          </div>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#2b2418]">
            Semantic Memory Operations
          </h2>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
            Analyze semantic topology,
            inspect cognitive telemetry,
            and orchestrate memory
            compression across the
            Synapse runtime.
          </p>
        </div>

        {/* STATUS */}
        <div className="rounded-[2rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                state ===
                'error'
                  ? 'bg-red-100'
                  : state ===
                    'loading'
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
              }`}
            >
              {state ===
              'loading' ? (
                <Loader2 className="h-8 w-8 animate-spin text-yellow-700" />
              ) : state ===
                'error' ? (
                <TriangleAlert className="h-8 w-8 text-red-700" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-700" />
              )}
            </div>

            <div>
              <p className="text-sm text-[#7b6f5c]">
                Runtime Status
              </p>

              <h3 className="text-2xl font-bold text-[#2b2418]">
                {state ===
                'loading'
                  ? 'Processing'
                  : state ===
                    'error'
                  ? 'Runtime Error'
                  : 'Operational'}
              </h3>

              <p className="mt-1 text-sm text-[#7b6f5c]">
                {activeOperation ||
                  runtimeLog}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={
            loadStats
          }
          disabled={
            state ===
            'loading'
          }
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-7 py-3 font-semibold text-[#3b3210] shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
        >
          <Activity className="h-5 w-5" />
          Load Telemetry
        </button>

        <button
          type="button"
          onClick={
            loadClusters
          }
          disabled={
            state ===
            'loading'
          }
          className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-7 py-3 font-semibold text-[#5f5545] transition hover:bg-yellow-100 disabled:opacity-60"
        >
          <Network className="h-5 w-5" />
          Analyze Clusters
        </button>

        <button
          type="button"
          onClick={
            compressMemory
          }
          disabled={
            state ===
            'loading'
          }
          className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white px-7 py-3 font-semibold text-[#5f5545] transition hover:bg-yellow-50 disabled:opacity-60"
        >
          <Sparkles className="h-5 w-5" />
          Compress Memory
        </button>
      </div>

      {/* TELEMETRY */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label:
              'Total Memories',
            value:
              stats
                ?.total_memories ??
              0,
            icon: Brain,
          },
          {
            label:
              'Episodic',
            value:
              stats
                ?.episodic_memories ??
              0,
            icon: Layers3,
          },
          {
            label:
              'Semantic',
            value:
              stats
                ?.semantic_memories ??
              0,
            icon: Database,
          },
          {
            label:
              'Compressed',
            value:
              stats
                ?.compressed_memories ??
              0,
            icon: Zap,
          },
          {
            label:
              'Avg Importance',
            value:
              stats
                ?.average_importance
                ? stats.average_importance.toFixed(
                    2
                  )
                : '0.00',
            icon: MemoryStick,
          },
        ].map(
          (
            item
          ) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.label
                }
                className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7b6f5c]">
                      {
                        item.label
                      }
                    </p>

                    <p className="mt-4 text-5xl font-bold text-[#2b2418]">
                      {
                        item.value
                      }
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-100">
                    <Icon className="h-8 w-8 text-amber-700" />
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* CLUSTERS */}
      <div className="mt-10 rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-[#2b2418]">
              Semantic Topology
            </h3>

            <p className="mt-2 text-[#7b6f5c]">
              Heuristic semantic
              clustering across long-term
              memory structures.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-[#7b6f5c]">
              Cluster Count
            </p>

            <p className="text-3xl font-bold text-[#2b2418]">
              {clusters
                ?.cluster_count ??
                0}
            </p>
          </div>
        </div>

        {!clusters ? (
          <div className="mt-8 rounded-3xl border border-dashed border-yellow-200 bg-yellow-50/50 p-12 text-center">
            <Network className="mx-auto h-12 w-12 text-amber-500" />

            <p className="mt-5 text-xl font-semibold text-[#2b2418]">
              No semantic clusters yet
            </p>

            <p className="mt-3 text-[#7b6f5c]">
              Run cluster analysis to
              inspect semantic memory
              topology.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {clusterEntries.map(
              (
                [
                  name,
                  ids,
                ],
                index
              ) => (
                <div
                  key={name}
                  className="overflow-hidden rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8]"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getClusterColor(
                      index
                    )}`}
                  />

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-[#2b2418]">
                        {name}
                      </h4>

                      <div className="rounded-full border border-yellow-200 bg-white px-3 py-1 text-xs text-[#5f5545]">
                        {
                          ids.length
                        }{' '}
                        memories
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {ids
                        .slice(
                          0,
                          5
                        )
                        .map(
                          (
                            id
                          ) => (
                            <div
                              key={
                                id
                              }
                              className="rounded-2xl border border-yellow-100 bg-white/70 px-4 py-3"
                            >
                              <p className="truncate text-sm text-[#5f5545]">
                                {
                                  id
                                }
                              </p>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* RUNTIME LOG */}
      <div className="mt-10 rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-amber-700" />

          <h3 className="text-xl font-bold text-[#2b2418]">
            Runtime Log
          </h3>
        </div>

        <div className="mt-5 rounded-3xl border border-yellow-100 bg-white/70 p-5">
          <p className="leading-7 text-[#5f5545]">
            {runtimeLog}
          </p>
        </div>
      </div>
    </section>
  );
}