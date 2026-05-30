
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  Globe,
  Layers3,
  MemoryStick,
  Network,
  Server,
  Sparkles,
  TimerReset,
  TriangleAlert,
} from 'lucide-react';

type HealthResponse = {
  status?: string;
  started_at?: string;
  cognition_stack?: {
    embedding_model?: {
      loaded?: boolean;
      model?: string;
      vector_size?: number;
    };
    reranker_model?: {
      loaded?: boolean;
      model?: string;
    };
  };
  infrastructure?: {
    qdrant?: {
      connected?: boolean;
      collection?: string;
    };
    redis?: {
      connected?: boolean;
    };
  };
};

type MemoryStats = {
  total_memories?: number;
  pinned_memories?: number;
  average_importance?: number;
  categories?: Record<string, number>;
};

async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/ai/health');

  if (!response.ok) {
    throw new Error('Failed to fetch health');
  }

  return response.json();
}

async function fetchStats(): Promise<MemoryStats | null> {
  const response = await fetch(
    '/api/ai/memory/stats'
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const started = performance.now();

      try {
        const [healthData, statsData] =
          await Promise.all([
            fetchHealth(),
            fetchStats().catch(() => null),
          ]);

        const ended = performance.now();

        setLatency(
          Math.round(ended - started)
        );

        setHealth(healthData);
        setStats(statsData);
        setLastCheckedAt(new Date());
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    }

    load();

    const interval = setInterval(
      load,
      30000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const isHealthy =
    health?.status === 'healthy';

  const embeddingLoaded =
    health?.cognition_stack
      ?.embedding_model?.loaded;

  const rerankerLoaded =
    health?.cognition_stack
      ?.reranker_model?.loaded;

  const redisConnected =
    health?.infrastructure?.redis
      ?.connected;

  const qdrantConnected =
    health?.infrastructure?.qdrant
      ?.connected;

  const categories =
    stats?.categories ?? {};

  const endpointCards = [
    {
      title: 'Semantic Retrieval',
      endpoint: '/retrieval/search',
    },
    {
      title: 'Memory Management',
      endpoint: '/memory',
    },
    {
      title: 'Cognitive Query',
      endpoint: '/ai/query',
    },
    {
      title: 'Embedding Runtime',
      endpoint: '/embed',
    },
    {
      title: 'System Health',
      endpoint: '/health',
    },
    {
      title: 'Model Runtime',
      endpoint: '/model',
    },
  ];

  const cognitionCards = useMemo(
    () => [
      {
        title: 'Embedding Runtime',
        value:
          health?.cognition_stack
            ?.embedding_model
            ?.model ??
          'Unavailable',
        status: embeddingLoaded,
        icon: Brain,
      },
      {
        title: 'Reranker Runtime',
        value:
          health?.cognition_stack
            ?.reranker_model
            ?.model ??
          'Unavailable',
        status: rerankerLoaded,
        icon: Layers3,
      },
      {
        title: 'Vector Database',
        value:
          qdrantConnected
            ? 'Qdrant Connected'
            : 'Disconnected',
        status: qdrantConnected,
        icon: Database,
      },
      {
        title: 'Working Memory Cache',
        value:
          redisConnected
            ? 'Redis Connected'
            : 'Disconnected',
        status: redisConnected,
        icon: MemoryStick,
      },
    ],
    [
      embeddingLoaded,
      rerankerLoaded,
      qdrantConnected,
      redisConnected,
      health,
    ]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8ea] px-6 py-10 sm:px-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="absolute bottom-[-100px] right-[-120px] h-[360px] w-[360px] rounded-full bg-orange-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* HERO */}
        <section className="overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl">
          <div className="grid gap-14 p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold tracking-wide text-amber-800">
                <Activity className="h-4 w-4" />
                Cognitive Runtime Monitoring
              </div>

              <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#2b2418] sm:text-7xl">
                Synapse Cognitive Status
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#5f5545] sm:text-xl">
                Monitor semantic retrieval,
                vector memory infrastructure,
                cognition runtimes, memory
                orchestration, and live system
                intelligence continuity.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  Open Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-white/70 px-8 py-3 text-sm font-semibold text-[#5a4b33] transition-all duration-300 hover:bg-yellow-50"
                >
                  Documentation
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffef8] to-[#fff5dd] p-8 shadow-inner">
              <div className="flex h-full flex-col justify-center gap-5">
                {cognitionCards.map(
                  (item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-4 rounded-3xl border border-yellow-200/50 bg-white/70 p-5 shadow-sm"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-sm">
                          <Icon className="h-7 w-7 text-amber-800" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-[#2b2418]">
                              {item.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.status
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.status
                                ? 'Online'
                                : 'Offline'}
                            </span>
                          </div>

                          <p className="mt-2 break-all text-sm leading-7 text-[#5f5545]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && !loading && (
          <section className="mt-10 rounded-[2rem] border border-red-200 bg-red-50/80 p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <TriangleAlert className="h-7 w-7 text-red-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-red-700">
                  Cognitive Runtime Failure
                </h2>

                <p className="mt-3 leading-7 text-red-600">
                  Unable to retrieve
                  Synapse cognitive
                  infrastructure state.
                </p>

                <p className="mt-3 text-sm text-red-500">
                  {error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STATUS GRID */}
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* ENGINE */}
          <div className="rounded-[2rem] border border-yellow-200/50 bg-white/80 p-8 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2b2418]">
                  Cognitive Engine
                </h2>

                <p className="mt-2 text-[#5f5545]">
                  Semantic memory runtime.
                </p>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                  isHealthy
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                <Brain
                  className={`h-8 w-8 ${
                    isHealthy
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                />
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-yellow-100 bg-yellow-50/60 p-6">
                <p className="text-[#5f5545]">
                  Checking cognition stack...
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div
                  className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
                    isHealthy
                      ? 'border border-green-200 bg-green-50'
                      : 'border border-red-200 bg-red-50'
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      isHealthy
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  />

                  <span
                    className={`font-semibold ${
                      isHealthy
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {isHealthy
                      ? 'Cognitive memory engine operational'
                      : 'Cognitive runtime degraded'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      label:
                        'Retrieval Latency',
                      value: latency
                        ? `${latency} ms`
                        : 'N/A',
                      icon: TimerReset,
                    },
                    {
                      label:
                        'Vector Size',
                      value:
                        health
                          ?.cognition_stack
                          ?.embedding_model
                          ?.vector_size ??
                        'N/A',
                      icon: Network,
                    },
                    {
                      label:
                        'Last Checked',
                      value:
                        lastCheckedAt?.toLocaleTimeString() ??
                        'N/A',
                      icon: Activity,
                    },
                    {
                      label:
                        'Collection',
                      value:
                        health
                          ?.infrastructure
                          ?.qdrant
                          ?.collection ??
                        'N/A',
                      icon: Database,
                    },
                  ].map((item) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-yellow-100 bg-yellow-50/50 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">
                            <Icon className="h-6 w-6 text-amber-700" />
                          </div>

                          <div>
                            <p className="text-sm text-[#7b6f5c]">
                              {item.label}
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#2b2418]">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* WEB */}
          <div className="rounded-[2rem] border border-yellow-200/50 bg-white/80 p-8 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2b2418]">
                  Synapse Web Runtime
                </h2>

                <p className="mt-2 text-[#5f5545]">
                  Cognitive workspace interface.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100">
                <Globe className="h-8 w-8 text-green-700" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 text-green-700" />

                <span className="font-semibold text-green-700">
                  Cognitive workspace online
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label:
                      'Dashboard Runtime',
                    value: 'Online',
                    icon: Globe,
                  },
                  {
                    label:
                      'Authentication',
                    value: 'Active',
                    icon: Server,
                  },
                  {
                    label:
                      'Semantic Retrieval',
                    value: 'Operational',
                    icon: Sparkles,
                  },
                  {
                    label:
                      'Memory Workspace',
                    value: 'Ready',
                    icon: Brain,
                  },
                ].map((item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-yellow-100 bg-yellow-50/50 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">
                          <Icon className="h-6 w-6 text-amber-700" />
                        </div>

                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            {item.label}
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[#2b2418]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-5 py-2 text-sm font-semibold text-[#3b3210] transition hover:scale-[1.02]"
                >
                  Open Dashboard
                </Link>

                <Link
                  href="/docs"
                  className="rounded-full border border-yellow-200 bg-white px-5 py-2 text-sm font-semibold text-[#5f5545] transition hover:bg-yellow-50"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MEMORY STATS */}
        {stats && (
          <section className="mt-14 rounded-[2.5rem] border border-yellow-200/50 bg-white/80 p-10 shadow-[0_10px_60px_rgba(255,220,120,0.12)] backdrop-blur-2xl">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-[#2b2418]">
                  Cognitive Memory Analytics
                </h2>

                <p className="mt-3 text-lg text-[#5f5545]">
                  Semantic memory runtime
                  statistics and retrieval
                  metrics.
                </p>
              </div>

              <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-lg lg:flex">
                <BarChart3 className="h-10 w-10 text-amber-800" />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {[
                {
                  label:
                    'Total Memories',
                  value:
                    stats.total_memories ??
                    0,
                  icon: Brain,
                },
                {
                  label:
                    'Pinned Memories',
                  value:
                    stats.pinned_memories ??
                    0,
                  icon: Sparkles,
                },
                {
                  label:
                    'Average Importance',
                  value:
                    stats.average_importance?.toFixed(
                      2
                    ) ?? '0.00',
                  icon: Activity,
                },
                {
                  label:
                    'Categories',
                  value:
                    Object.keys(
                      categories
                    ).length,
                  icon: Database,
                },
              ].map((item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff6df] p-7 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#7b6f5c]">
                          {item.label}
                        </p>

                        <p className="mt-4 text-5xl font-bold text-[#2b2418]">
                          {item.value}
                        </p>
                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-100">
                        <Icon className="h-8 w-8 text-amber-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ENDPOINTS */}
        <section className="mt-14 mb-20 rounded-[2.5rem] border border-yellow-200/50 bg-white/80 p-10 shadow-[0_10px_60px_rgba(255,220,120,0.12)] backdrop-blur-2xl">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-[#2b2418]">
              Cognitive Runtime Endpoints
            </h2>

            <p className="mt-3 text-lg text-[#5f5545]">
              Semantic retrieval and memory
              infrastructure APIs.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {endpointCards.map(
              (endpoint) => (
                <div
                  key={endpoint.endpoint}
                  className="rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e7] p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-semibold text-[#2b2418]">
                        {endpoint.title}
                      </h3>

                      <p className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 font-mono text-sm text-amber-700">
                        {endpoint.endpoint}
                      </p>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        isHealthy
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isHealthy
                        ? 'Operational'
                        : 'Unavailable'}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
