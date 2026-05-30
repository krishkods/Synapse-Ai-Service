'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  Layers3,
  MemoryStick,
  Search,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react';

import {
  getMemories,
  queryMemories,
  type RetrievalResponse,
} from '@/lib/synapse-ai-client';
import RelevantMemoriesPanel from './RelevantMemoriesPanel';

type MemoryRecord = {
  id: string;
  text: string;
  category: string;
  importance: number;
  tags?: string[];
  relevance?: number;
  created_at?: string;
};

const memorySections = [
  {
    label: 'Identity',
    category: 'identity',
  },
  {
    label: 'Goals',
    category: 'goal',
  },
  {
    label: 'Projects',
    category: 'project',
  },
  {
    label: 'Preferences',
    category: 'preference',
  },
  {
    label: 'Skills',
    category: 'skill',
  },
  {
    label: 'Relationships',
    category: 'relationship',
  },
  {
    label: 'Recent Context',
    category: 'temporary',
  },
] as const;

const exampleQueries = [
  'What is my name?',
  'What stack do I prefer?',
  'What projects am I building?',
  'What goals do I have?',
  'What skills do I know?',
];

function formatCategory(
  category: string
) {
  return category
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (c) =>
        c.toUpperCase()
    );
}

function formatDate(
  value?: string
) {
  if (!value)
    return 'Unknown';

  return new Date(
    value
  ).toLocaleString();
}

function getImportanceGradient(
  importance: number
) {
  if (importance >= 0.85) {
    return 'from-amber-400 to-orange-500';
  }

  if (importance >= 0.6) {
    return 'from-cyan-400 to-blue-500';
  }

  return 'from-slate-400 to-slate-500';
}

export default function LLMChatPanel({
  userName,
}: {
  userName: string;
}) {
  const [query, setQuery] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [
    retrievalLatency,
    setRetrievalLatency,
  ] = useState<
    number | null
  >(null);

  const [
    retrievalResult,
    setRetrievalResult,
  ] =
    useState<RetrievalResponse | null>(
      null
    );

  const [
    memorySnapshot,
    setMemorySnapshot,
  ] = useState<
    Record<
      string,
      MemoryRecord[]
    >
  >({});

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  async function loadMemorySnapshot() {
    setRefreshing(true);

    try {
      const response =
        await getMemories({
          limit: 50,
        });

      const grouped: Record<
        string,
        MemoryRecord[]
      > = {};

      for (const memory of response.memories) {
        const section =
          memorySections.find(
            (
              item
            ) =>
              item.category ===
              memory.category
          )?.label ||
          'Recent Context';

        if (
          !grouped[
            section
          ]
        ) {
          grouped[
            section
          ] = [];
        }

        grouped[
          section
        ].push(memory);
      }

      setMemorySnapshot(
        grouped
      );
    } catch (
      err: unknown
    ) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load memories'
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadMemorySnapshot();
      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  async function handleRetrieval() {
    if (
      !query.trim()
    ) {
      setError(
        'Please enter a semantic retrieval query.'
      );

      return;
    }

    setLoading(true);

    setError(null);

    try {
      const started =
        performance.now();

      const response =
        await queryMemories(
          query.trim(),
          10
        );

      const ended =
        performance.now();

      setRetrievalLatency(
        Math.round(
          ended - started
        )
      );

      setRetrievalResult(
        response
      );
    } catch (
      err: unknown
    ) {
      setError(
        err instanceof Error
          ? err.message
          : 'Retrieval failed'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_20px_80px_rgba(255,210,90,0.15)] backdrop-blur-2xl">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold text-amber-800">
            <Brain className="h-4 w-4" />
            Cognitive Retrieval Runtime
          </div>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#2b2418]">
            Semantic Memory Workspace
          </h2>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
            Persistent semantic memory,
            reranked retrieval, working
            context, and structured
            cognition for{' '}
            {userName}.
          </p>
        </div>

        <div className="rounded-[2rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6]">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>

            <div>
              <p className="text-sm text-[#7b6f5c]">
                Cognitive Runtime
              </p>

              <h3 className="text-2xl font-bold text-[#2b2418]">
                Online
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              {
                label:
                  'Semantic Retrieval',
                icon: Search,
              },
              {
                label:
                  'Working Memory',
                icon: MemoryStick,
              },
              {
                label:
                  'Reranked Context',
                icon: Layers3,
              },
              {
                label:
                  'Vector Cognition',
                icon: Database,
              },
            ].map((item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-yellow-100 bg-white/70 px-4 py-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100">
                    <Icon className="h-5 w-5 text-amber-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#2b2418]">
                      {item.label}
                    </p>

                    <p className="text-xs text-[#7b6f5c]">
                      Operational
                    </p>
                  </div>

                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-8 flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50/80 p-6 text-red-700">
          <TriangleAlert className="mt-1 h-5 w-5" />

          <div>
            <p className="font-semibold">
              Retrieval Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1fr]">
        {/* LEFT */}
        <div className="space-y-8">
          {/* RETRIEVAL */}
          <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <Search className="h-7 w-7 text-amber-700" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#2b2418]">
                  Semantic Retrieval
                </h3>

                <p className="text-[#7b6f5c]">
                  Retrieve structured
                  cognitive memories.
                </p>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              rows={6}
              placeholder="Ask Synapse something meaningful..."
              className="mt-8 w-full rounded-3xl border border-yellow-200 bg-white/80 p-5 text-[#2b2418] outline-none transition focus:border-amber-400"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {exampleQueries.map(
                (
                  example
                ) => (
                  <button
                    key={example}
                    onClick={() =>
                      setQuery(
                        example
                      )
                    }
                    className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-[#5f5545] transition hover:bg-yellow-100"
                  >
                    {example}
                  </button>
                )
              )}
            </div>

            <button
              onClick={
                handleRetrieval
              }
              disabled={loading}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-7 py-3 font-semibold text-[#3b3210] shadow-lg transition hover:scale-[1.02]"
            >
              <Zap className="h-5 w-5" />

              {loading
                ? 'Retrieving...'
                : 'Retrieve Context'}
            </button>

            {retrievalLatency && (
              <div className="mt-5 flex items-center gap-2 text-sm text-[#7b6f5c]">
                <Clock3 className="h-4 w-4" />

                Retrieval completed in{' '}
                <span className="font-semibold text-[#2b2418]">
                  {
                    retrievalLatency
                  }
                  ms
                </span>
              </div>
            )}
          </div>

          {/* MEMORY SNAPSHOT */}
          <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#2b2418]">
                  Cognitive Memory
                </h3>

                <p className="mt-2 text-[#7b6f5c]">
                  Structured long-term
                  memory grouped by
                  semantic category.
                </p>
              </div>

              <button
                onClick={() =>
                  void loadMemorySnapshot()
                }
                disabled={refreshing}
                className="rounded-full border border-yellow-200 bg-yellow-50 px-5 py-2 text-sm font-semibold text-[#5f5545] transition hover:bg-yellow-100"
              >
                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}
              </button>
            </div>

            <div className="mt-8 space-y-5">
              {memorySections.map(
                (
                  section
                ) => {
                  const items =
                    memorySnapshot[
                      section.label
                    ] || [];

                  return (
                    <div
                      key={
                        section.label
                      }
                      className="rounded-3xl border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-[#2b2418]">
                          {
                            section.label
                          }
                        </h4>

                        <span className="rounded-full border border-yellow-200 bg-white px-3 py-1 text-xs text-[#5f5545]">
                          {
                            items.length
                          }{' '}
                          memories
                        </span>
                      </div>

                      {items.length ===
                      0 ? (
                        <p className="mt-4 text-sm text-[#7b6f5c]">
                          No memories
                          stored.
                        </p>
                      ) : (
                        <div className="mt-5 space-y-4">
                          {items
                            .slice(
                              0,
                              5
                            )
                            .map(
                              (
                                memory
                              ) => (
                                <article
                                  key={
                                    memory.id
                                  }
                                  className="rounded-2xl border border-yellow-100 bg-white/70 p-4"
                                >
                                  <p className="leading-7 text-[#2b2418]">
                                    {
                                      memory.text
                                    }
                                  </p>

                                  <div className="mt-4 flex items-center justify-between gap-4">
                                    <span className="text-xs text-[#7b6f5c]">
                                      {formatDate(
                                        memory.created_at
                                      )}
                                    </span>

                                    <div className="w-24">
                                      <div className="rounded-full bg-yellow-100 p-1">
                                        <div
                                          className={`h-2 rounded-full bg-gradient-to-r ${getImportanceGradient(
                                            memory.importance
                                          )}`}
                                          style={{
                                            width: `${Math.max(
                                              memory.importance *
                                                100,
                                              10
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              )
                            )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8">
            <RelevantMemoriesPanel
              data={retrievalResult}
              latencyMs={retrievalLatency}
            />
          </div>

          {/* CONTEXT SUMMARY */}
          <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <Activity className="h-7 w-7 text-amber-700" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#2b2418]">
                  Working Context
                </h3>

                <p className="text-[#7b6f5c]">
                  Active cognitive runtime
                  state.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[
                {
                  label:
                    'Retrieved Memories',
                  value:
                    retrievalResult
                      ?.results
                      ?.length || 0,
                },
                {
                  label:
                    'Memory Sections',
                  value:
                    retrievalResult
                      ?.context_summary
                      ?.total_sections ||
                    0,
                },
                {
                  label:
                    'Working Context',
                  value:
                    retrievalResult
                      ?.context_summary
                      ?.memory_count ||
                    0,
                },
                {
                  label:
                    'Runtime Latency',
                  value:
                    retrievalLatency
                      ? `${retrievalLatency} ms`
                      : 'N/A',
                },
              ].map((item) => (
                <div
                  key={
                    item.label
                  }
                  className="rounded-3xl border border-yellow-100 bg-white/70 p-5"
                >
                  <p className="text-sm text-[#7b6f5c]">
                    {item.label}
                  </p>

                  <p className="mt-3 text-4xl font-bold text-[#2b2418]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
