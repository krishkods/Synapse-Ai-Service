'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Activity,
  BarChart3,
  Bookmark,
  BookmarkPlus,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  Layers3,
  MemoryStick,
  Network,
  Search,
  Server,
  Sparkles,
  Trash2,
  TriangleAlert,
  User2,
  Zap,
} from 'lucide-react';

import {
  createMemory,
  deleteSavedQuery,
  extractMemory,
  getHealthStatus,
  getMemories,
  getMemoryStats,
  getSavedQueries,
  queryMemories,
  saveQuery,
  type MemoryItem,
  type MemoryMode as ExtractionMode,
  type SavedQuery,
} from '@/lib/synapse-ai-client';
import type { RetrievalResponse } from '@/lib/retrieval-display';
import MemoryLibraryPanel from './MemoryLibraryPanel';
import RelevantMemoriesPanel from './RelevantMemoriesPanel';


type MemoryStats = {
  total_memories: number;
  average_importance: number;
  categories?: Record<
    string,
    number
  >;
  working_memories?: number;
  compressed_memories?: number;
  pinned_memories?: number;
};

type StoreMode =
  | ExtractionMode
  | 'manual';

const categories = [
  'identity',
  'project',
  'goal',
  'preference',
  'skill',
  'relationship',
  'temporary',
  'conversation',
];

const retrievalExamples = [
  'What is my name?',
  'What stack do I prefer?',
  'What projects am I building?',
  'What are my goals?',
  'What skills do I have?',
];

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error)
    return error.message;

  if (
    typeof error ===
    'string'
  )
    return error;

  return 'Unexpected error occurred';
}

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

export default function DashboardClient(
  props: {
  userId: string;
  userName: string;
}
) {
  const { userName } = props;
  const [activeTab, setActiveTab] =
    useState<
      'retrieve' | 'store' | 'manage' | 'stats'
    >('retrieve');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [success, setSuccess] =
    useState<string | null>(
      null
    );

  const [queryText, setQueryText] =
    useState('');
  const [queryCategory, setQueryCategory] =
    useState('all');
  const [queryTags, setQueryTags] =
    useState('');
  const [queryTopK, setQueryTopK] =
    useState(10);
  const [savedQueryName, setSavedQueryName] =
    useState('');
  const [savedQueries, setSavedQueries] =
    useState<SavedQuery[]>([]);

  const [
    queryResponse,
    setQueryResponse,
  ] =
    useState<RetrievalResponse | null>(
      null
    );

  const [
    retrievalLatency,
    setRetrievalLatency,
  ] = useState<
    number | null
  >(null);

  const [
    memoryInput,
    setMemoryInput,
  ] = useState('');

  const [memoryMode, setMemoryMode] =
    useState<StoreMode>(
      'smart'
    );

  const [
    manualCategory,
    setManualCategory,
  ] = useState(
    'conversation'
  );

  const [
    manualImportance,
    setManualImportance,
  ] = useState(0.7);

  const [manualTags, setManualTags] =
    useState('');

  const [memories, setMemories] =
    useState<MemoryItem[]>(
      []
    );

  const [stats, setStats] =
    useState<MemoryStats | null>(
      null
    );

  const [
    serviceHealth,
    setServiceHealth,
  ] = useState<
    boolean | null
  >(null);

  async function loadMemories(archivedOnly = false) {
    try {
      const response =
        await getMemories({
          limit: 100,
          archived_only: archivedOnly,
        });

      setMemories(
        response.memories || []
      );
    } catch (
      err: unknown
    ) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  async function loadStats() {
    try {
      const statsData =
        await getMemoryStats();

      setStats(statsData);
    } catch (
      err: unknown
    ) {
      setError(
        getErrorMessage(err)
      );
    }
  }

  async function loadHealth() {
    try {
      await getHealthStatus();

      setServiceHealth(true);
    } catch {
      setServiceHealth(false);
    }
  }

  async function loadSavedQueryList() {
    try {
      const data = await getSavedQueries();
      setSavedQueries(data.savedQueries || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void Promise.all([
          loadMemories(),
          loadStats(),
          loadHealth(),
          loadSavedQueryList(),
        ]);
      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        if (
          activeTab === 'store' ||
          activeTab === 'manage'
        ) {
          void loadMemories(false);
        }

        if (
          activeTab === 'stats'
        ) {
          void Promise.all([
            loadStats(),
            loadHealth(),
          ]);
        }
      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [activeTab]);

  async function handleQuery() {
    if (
      !queryText.trim()
    ) {
      setError(
        'Please enter a retrieval query.'
      );

      return;
    }

    setLoading(true);

    setError(null);

    setSuccess(null);

    try {
      const started =
        performance.now();

      const response =
        await queryMemories(
          queryText.trim(),
          queryTopK,
          {
            category:
              queryCategory === 'all'
                ? undefined
                : queryCategory,
            tags: queryTags
              .split(',')
              .map((tag) =>
                tag.trim()
              )
              .filter(Boolean),
          }
        );

      const ended =
        performance.now();

      setRetrievalLatency(
        Math.round(
          ended - started
        )
      );

      setQueryResponse(
        response
      );

      setSuccess(
        'Relevant memories retrieved.'
      );
    } catch (
      err: unknown
    ) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveQuery() {
    if (!queryText.trim()) {
      setError('Enter a query before saving it.');
      return;
    }

    if (!savedQueryName.trim()) {
      setError('Give this saved query a name.');
      return;
    }

    try {
      setError(null);
      await saveQuery({
        name: savedQueryName.trim(),
        query: queryText.trim(),
        category:
          queryCategory === 'all'
            ? null
            : queryCategory,
        tags: queryTags
          .split(',')
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean),
        topK: queryTopK,
      });
      setSavedQueryName('');
      setSuccess('Saved query stored.');
      await loadSavedQueryList();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDeleteSavedQuery(id: string) {
    try {
      setError(null);
      await deleteSavedQuery(id);
      setSuccess('Saved query removed.');
      await loadSavedQueryList();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  }

  function applySavedQuery(savedQuery: SavedQuery) {
    setQueryText(savedQuery.query);
    setQueryCategory(savedQuery.category || 'all');
    setQueryTags((savedQuery.tags || []).join(', '));
    setQueryTopK(savedQuery.topK || 10);
    setSuccess(`Loaded saved query "${savedQuery.name}".`);
  }

  async function handleStoreMemory() {
    if (
      !memoryInput.trim()
    ) {
      setError(
        'Please enter a memory.'
      );

      return;
    }

    setLoading(true);

    setError(null);

    setSuccess(null);

    try {
      if (
        memoryMode ===
        'smart'
      ) {
        const result =
          await extractMemory(
            memoryInput.trim(),
            'smart'
          );

        setSuccess(
          `Stored ${result.stored.length} structured memories.`
        );
      } else if (
        memoryMode ===
        'full'
      ) {
        const result =
          await extractMemory(
            memoryInput.trim(),
            'full'
          );

        setSuccess(
          `Stored ${result.stored.length} conversation memories.`
        );
      } else {
        const tags =
          manualTags
            .split(',')
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean);

        await createMemory({
          text:
            memoryInput.trim(),
          importance:
            manualImportance,
          category:
            manualCategory as never,
          tags,
          metadata: {
            source: 'manual',
            created_by:
              'user',
          },
        });

        setSuccess(
          'Memory stored successfully.'
        );
      }

      setMemoryInput('');

      setManualTags('');

      await Promise.all([
        loadMemories(),
        loadStats(),
      ]);
    } catch (
      err: unknown
    ) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  const groupedMemories =
    useMemo(() => {
      return memories.reduce<
        Record<
          string,
          MemoryItem[]
        >
      >(
        (
          accumulator,
          memory
        ) => {
          if (
            !accumulator[
              memory.category
            ]
          ) {
            accumulator[
              memory.category
            ] = [];
          }

          accumulator[
            memory.category
          ].push(memory);

          return accumulator;
        },
        {}
      );
    }, [memories]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="overflow-hidden rounded-[2.5rem] border border-yellow-200/40 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.15)] backdrop-blur-2xl">
        <div className="grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold text-amber-800">
              <Brain className="h-4 w-4" />
              Synapse Cognitive Runtime
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[#2b2418]">
              Cognitive Memory Workspace
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5f5545]">
              Persistent semantic memory,
              reranked retrieval,
              working context, and
              structured cognition for
              long-term intelligence
              continuity.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-yellow-100 bg-yellow-50/70 px-5 py-4">
                <p className="text-sm text-[#7b6f5c]">
                  Active Memories
                </p>

                <p className="mt-2 text-3xl font-bold text-[#2b2418]">
                  {stats
                    ?.total_memories ??
                    0}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50/70 px-5 py-4">
                <p className="text-sm text-[#7b6f5c]">
                  Avg Importance
                </p>

                <p className="mt-2 text-3xl font-bold text-[#2b2418]">
                  {stats?.average_importance?.toFixed(
                    2
                  ) ?? '0.00'}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50/70 px-5 py-4">
                <p className="text-sm text-[#7b6f5c]">
                  Runtime
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      serviceHealth
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />

                  <span className="text-lg font-semibold text-[#2b2418]">
                    {serviceHealth
                      ? 'Healthy'
                      : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-[2rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6]">
                <User2 className="h-7 w-7 text-amber-700" />
              </div>

              <div>
                <p className="text-sm text-[#7b6f5c]">
                  Active User
                </p>

                <h3 className="text-2xl font-bold text-[#2b2418]">
                  {userName}
                </h3>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                {
                  label:
                    'Semantic Retrieval',
                  icon: Search,
                },
                {
                  label:
                    'Reranked Context',
                  icon: Layers3,
                },
                {
                  label:
                    'Working Memory',
                  icon: MemoryStick,
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
                    className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white/70 px-5 py-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">
                      <Icon className="h-6 w-6 text-amber-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-[#2b2418]">
                        {item.label}
                      </p>

                      <p className="text-sm text-[#7b6f5c]">
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
      </section>

      {/* TABS */}
      <section className="flex flex-wrap gap-3">
        {(
          [
            'retrieve',
            'store',
            'manage',
            'stats',
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(
                tab
              )
            }
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              activeTab ===
              tab
                ? 'bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] text-[#3b3210] shadow-lg'
                : 'border border-yellow-200 bg-white/70 text-[#5f5545] hover:bg-yellow-50'
            }`}
          >
            {tab ===
              'retrieve' &&
              'Semantic Retrieval'}

            {tab ===
              'store' &&
              'Memory Store'}

            {tab ===
              'manage' &&
              'Memory Library'}

            {tab ===
              'stats' &&
              'Cognitive Telemetry'}
          </button>
        ))}
      </section>

      {/* ALERTS */}
      {error && (
        <div className="flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50/80 p-6 text-red-700">
          <TriangleAlert className="mt-1 h-5 w-5" />

          <div>
            <p className="font-semibold">
              Runtime Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-4 rounded-3xl border border-green-200 bg-green-50/80 p-6 text-green-700">
          <CheckCircle2 className="mt-1 h-5 w-5" />

          <div>
            <p className="font-semibold">
              Success
            </p>

            <p className="mt-1 text-sm">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* RETRIEVAL */}
      {activeTab ===
        'retrieve' && (
        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          {/* QUERY */}
          <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <Search className="h-7 w-7 text-amber-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#2b2418]">
                  Global Memory Search
                </h2>

                <p className="text-[#7b6f5c]">
                  Hybrid semantic, keyword,
                  and temporal retrieval
                  across your memory graph.
                </p>
              </div>
            </div>

            <textarea
              value={queryText}
              onChange={(e) =>
                setQueryText(
                  e.target.value
                )
              }
              rows={6}
              placeholder="Ask Synapse something..."
              className="mt-8 w-full rounded-3xl border border-yellow-200 bg-[#fffdf7] p-5 text-[#2b2418] outline-none transition focus:border-amber-400"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                  Category Filter
                </label>
                <select
                  value={queryCategory}
                  onChange={(e) =>
                    setQueryCategory(e.target.value)
                  }
                  className="w-full rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                  Tags Filter
                </label>
                <input
                  value={queryTags}
                  onChange={(e) =>
                    setQueryTags(e.target.value)
                  }
                  placeholder="startup, react, launch"
                  className="w-full rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418] outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                  Top Matches
                </label>
                <select
                  value={queryTopK}
                  onChange={(e) =>
                    setQueryTopK(Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418]"
                >
                  {[5, 10, 15, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {retrievalExamples.map(
                (
                  example
                ) => (
                  <button
                    key={example}
                    onClick={() =>
                      setQueryText(
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
                handleQuery
              }
              disabled={loading}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-7 py-3 font-semibold text-[#3b3210] shadow-lg transition hover:scale-[1.02]"
            >
              <Zap className="h-5 w-5" />
              {loading
                ? 'Retrieving...'
                : 'Retrieve Context'}
            </button>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={savedQueryName}
                onChange={(e) =>
                  setSavedQueryName(e.target.value)
                }
                placeholder="Name this search"
                className="flex-1 rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  void handleSaveQuery()
                }
                className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-200 bg-white px-6 py-3 text-sm font-semibold text-[#5f5545] transition hover:bg-yellow-50"
              >
                <BookmarkPlus className="h-4 w-4" />
                Save Query
              </button>
            </div>

            {retrievalLatency && (
              <div className="mt-6 flex items-center gap-2 text-sm text-[#7b6f5c]">
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

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
              <div className="flex items-center gap-3">
                <Bookmark className="h-6 w-6 text-amber-700" />
                <div>
                  <h3 className="text-2xl font-bold text-[#2b2418]">
                    Saved Queries
                  </h3>
                  <p className="text-[#7b6f5c]">
                    Reuse common project, goal, and temporal searches.
                  </p>
                </div>
              </div>

              {savedQueries.length === 0 ? (
                <p className="mt-6 rounded-3xl border border-dashed border-yellow-200 bg-yellow-50/40 p-6 text-[#7b6f5c]">
                  No saved queries yet.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {savedQueries.map((savedQuery) => (
                    <div
                      key={savedQuery.id}
                      className="rounded-3xl border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#2b2418]">
                            {savedQuery.name}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#5f5545]">
                            {savedQuery.query}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#7b6f5c]">
                            <span>Top {savedQuery.topK}</span>
                            {savedQuery.category && (
                              <span>{formatCategory(savedQuery.category)}</span>
                            )}
                            {(savedQuery.tags || []).map((tag) => (
                              <span key={tag}>#{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => applySavedQuery(savedQuery)}
                            className="rounded-full border border-yellow-200 bg-white px-4 py-2 text-xs font-semibold text-[#5f5545]"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteSavedQuery(savedQuery.id)
                            }
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
            <RelevantMemoriesPanel
              data={queryResponse}
              latencyMs={retrievalLatency}
            />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'manage' && (
        <section>
          <MemoryLibraryPanel
            memories={memories}
            loading={loading}
            onRefresh={async (showArchived) => {
              await Promise.all([
                loadMemories(showArchived),
                loadStats(),
              ]);
            }}
          />
        </section>
      )}

      {/* STORE */}
      {activeTab ===
        'store' && (
        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          {/* INPUT */}
          <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <Brain className="h-7 w-7 text-amber-700" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#2b2418]">
                  Store Memory
                </h2>

                <p className="text-[#7b6f5c]">
                  Add durable cognitive
                  memories.
                </p>
              </div>
            </div>

            <textarea
              value={
                memoryInput
              }
              onChange={(e) =>
                setMemoryInput(
                  e.target.value
                )
              }
              rows={7}
              placeholder="Enter a memory..."
              className="mt-8 w-full rounded-3xl border border-yellow-200 bg-[#fffdf7] p-5 text-[#2b2418] outline-none transition focus:border-amber-400"
            />

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                  Memory Mode
                </label>

                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      'smart',
                      'manual',
                      'full',
                    ] as const
                  ).map(
                    (
                      mode
                    ) => (
                      <button
                        key={
                          mode
                        }
                        onClick={() =>
                          setMemoryMode(
                            mode
                          )
                        }
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                          memoryMode ===
                          mode
                            ? 'bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] text-[#3b3210]'
                            : 'border border-yellow-200 bg-white text-[#5f5545]'
                        }`}
                      >
                        {
                          mode
                        }
                      </button>
                    )
                  )}
                </div>
              </div>

              {memoryMode ===
                'manual' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                      Category
                    </label>

                    <select
                      value={
                        manualCategory
                      }
                      onChange={(
                        e
                      ) =>
                        setManualCategory(
                          e.target
                            .value
                        )
                      }
                      className="w-full rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418] outline-none"
                    >
                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {formatCategory(
                              category
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                      Tags
                    </label>

                    <input
                      value={
                        manualTags
                      }
                      onChange={(
                        e
                      ) =>
                        setManualTags(
                          e.target
                            .value
                        )
                      }
                      placeholder="mern, startup, fitness"
                      className="w-full rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418] outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
                      Importance:{' '}
                      {manualImportance.toFixed(
                        2
                      )}
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={
                        manualImportance
                      }
                      onChange={(
                        e
                      ) =>
                        setManualImportance(
                          Number(
                            e
                              .target
                              .value
                          )
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <button
                onClick={
                  handleStoreMemory
                }
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-7 py-3 font-semibold text-[#3b3210] shadow-lg transition hover:scale-[1.02]"
              >
                <Sparkles className="h-5 w-5" />
                Store Memory
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
            <h2 className="text-2xl font-bold text-[#2b2418]">
              Memory Overview
            </h2>
            <p className="mt-2 text-[#7b6f5c]">
              Edit, pin, archive, and search memories in the Memory Library tab.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {Object.entries(groupedMemories).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-2xl border border-yellow-100 bg-yellow-50/50 px-5 py-4"
                >
                  <p className="font-semibold text-[#2b2418]">
                    {formatCategory(category)}
                  </p>
                  <p className="mt-1 text-sm text-[#7b6f5c]">
                    {items.length} memories
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className="mt-8 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-7 py-3 text-sm font-semibold text-[#3b3210]"
            >
              Open Memory Library
            </button>
          </div>
        </section>
      )}

      {/* STATS */}
      {activeTab ===
        'stats' && (
        <section className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                  'Average Importance',
                value:
                  stats?.average_importance?.toFixed(
                    2
                  ) ?? '0.00',
                icon: Activity,
              },
              {
                label:
                  'Working Memory',
                value:
                  stats
                    ?.working_memories ??
                  0,
                icon: MemoryStick,
              },
              {
                label:
                  'Compressed',
                value:
                  stats
                    ?.compressed_memories ??
                  0,
                icon: Layers3,
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
                    className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-7 shadow-[0_10px_60px_rgba(255,220,120,0.10)]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#7b6f5c]">
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

          <div className="grid gap-8 lg:grid-cols-2">
            {/* CATEGORY */}
            <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-7 w-7 text-amber-700" />

                <h2 className="text-2xl font-bold text-[#2b2418]">
                  Memory Categories
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {Object.entries(
                  stats
                    ?.categories ||
                    {}
                ).map(
                  ([
                    category,
                    value,
                  ]) => (
                    <div
                      key={
                        category
                      }
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-[#2b2418]">
                          {formatCategory(
                            category
                          )}
                        </span>

                        <span className="text-sm text-[#7b6f5c]">
                          {
                            value
                          }
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-yellow-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ffd95c] to-[#ffb347]"
                          style={{
                            width: `${Math.min(
                              value *
                                10,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* SYSTEM */}
            <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]">
              <div className="flex items-center gap-3">
                <Server className="h-7 w-7 text-amber-700" />

                <h2 className="text-2xl font-bold text-[#2b2418]">
                  Runtime Infrastructure
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {[
                  {
                    label:
                      'Embedding Runtime',
                    icon: Brain,
                    status:
                      serviceHealth,
                  },
                  {
                    label:
                      'Qdrant Vector Store',
                    icon: Database,
                    status:
                      serviceHealth,
                  },
                  {
                    label:
                      'Redis Working Memory',
                    icon: MemoryStick,
                    status:
                      serviceHealth,
                  },
                  {
                    label:
                      'Semantic Retrieval',
                    icon: Network,
                    status:
                      serviceHealth,
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
                        className="flex items-center gap-4 rounded-3xl border border-yellow-100 bg-yellow-50/50 p-5"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                          <Icon className="h-7 w-7 text-amber-700" />
                        </div>

                        <div>
                          <p className="font-semibold text-[#2b2418]">
                            {
                              item.label
                            }
                          </p>

                          <p className="text-sm text-[#7b6f5c]">
                            {item.status
                              ? 'Operational'
                              : 'Unavailable'}
                          </p>
                        </div>

                        <div
                          className={`ml-auto h-4 w-4 rounded-full ${
                            item.status
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
