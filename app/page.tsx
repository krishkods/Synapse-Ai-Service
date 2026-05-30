'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const stackFeatures = [
  {
    icon: Cpu,
    title: 'BGE-small-en-v1.5 Embeddings',
    description:
      'Local normalized embeddings with Redis cache and batch support for fast semantic understanding.',
  },
  {
    icon: Layers3,
    title: 'BGE Reranker Pipeline',
    description:
      'Top-10 cross-encoder reranking turns approximate vector search into precise cognitive retrieval.',
  },
  {
    icon: Database,
    title: 'Redis Cognition Cache',
    description:
      'Embedding, retrieval, and working-memory caches with TTL for speed at scale.',
  },
  {
    icon: ShieldCheck,
    title: 'User-Controlled Memory',
    description:
      'Edit, pin, archive, and delete memories. Trust through transparency and control.',
  },
];

const retrievalSteps = [
  {
    step: '1',
    title: 'Query',
    text: 'User asks a natural-language question.',
  },
  {
    step: '2',
    title: 'Embed',
    text: 'BGE-small-en-v1.5 creates a normalized query vector (cached in Redis).',
  },
  {
    step: '3',
    title: 'Retrieve',
    text: 'Qdrant returns semantic candidates; duplicates and low-confidence hits are filtered.',
  },
  {
    step: '4',
    title: 'Rerank',
    text: 'BGE reranker scores top candidates and returns the most relevant memories.',
  },
  {
    step: '5',
    title: 'Present',
    text: 'Clean “Relevant Memories” output — no raw vector debug dumps.',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] text-[#2b2418]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[500px] w-[500px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-10 sm:px-10">
        {/* HERO */}
        <section className="pt-12 sm:pt-20">
          <div className="overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl">
            <div className="grid items-center gap-14 p-8 lg:grid-cols-2 lg:p-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold tracking-wide text-amber-800">
                  <Brain className="h-4 w-4" />
                  Synapse Cognitive Infrastructure
                </div>

                <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#2b2418] sm:text-6xl">
                  AI That Remembers You — With{' '}
                  <span className="text-amber-800">Semantic Precision</span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5f5545] sm:text-xl">
                  Synapse is the persistent memory layer for AI: BGE embeddings,
                  cross-encoder reranking, Redis-backed caching, and a structured
                  memory dashboard — built for continuity that feels intelligent.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition hover:scale-[1.02]"
                  >
                    Start Building Memory
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-white/70 px-8 py-3 text-sm font-semibold text-[#5a4b33] transition hover:bg-yellow-50"
                  >
                    Open Dashboard
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-yellow-50/70 px-8 py-3 text-sm font-semibold text-amber-800 transition hover:bg-yellow-100"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffef8] to-[#fff6df] p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                  Live retrieval preview
                </p>
                <div className="mt-6 space-y-3 rounded-2xl border border-yellow-100 bg-white/90 p-6 font-mono text-sm text-[#4d4333]">
                  <p className="font-semibold text-[#2b2418]">Relevant Memories</p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    User is building Synapse AI
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    User prefers MERN stack
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    User&apos;s goal is to ship cognitive infrastructure
                  </p>
                </div>
                <p className="mt-4 text-xs text-[#7b6f5c]">
                  Demo video/GIF slot — record your dashboard retrieval flow here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="py-24">
          <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
            Architecture
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
            Synapse sits between your application and durable semantic memory —
            orchestrating embeddings, vector search, reranking, and structured context.
          </p>

          <div className="mt-12 grid gap-4 rounded-[2rem] border border-yellow-200/50 bg-white/80 p-8 lg:grid-cols-5">
            {[
              { label: 'Web / API', sub: 'Next.js portal' },
              { label: 'FastAPI', sub: 'Cognition engine' },
              { label: 'BGE Embed', sub: '384-d normalized' },
              { label: 'Qdrant', sub: 'Vector memory' },
              { label: 'Redis', sub: 'Cache layer' },
            ].map((node, index) => (
              <div key={node.label} className="relative text-center">
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50/80 px-4 py-6">
                  <p className="font-semibold text-[#2b2418]">{node.label}</p>
                  <p className="mt-2 text-xs text-[#7b6f5c]">{node.sub}</p>
                </div>
                {index < 4 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-amber-600 lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* RETRIEVAL FLOW */}
        <section className="pb-24">
          <div className="mb-10 flex items-center gap-3">
            <Search className="h-8 w-8 text-amber-700" />
            <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
              Retrieval Flow
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {retrievalSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.8rem] border border-yellow-200/40 bg-white/75 p-6 shadow-[0_8px_30px_rgba(255,220,120,0.10)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] text-sm font-bold text-[#3b3210]">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[#2b2418]">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-[#5f5545]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEMANTIC MEMORY */}
        <section className="pb-24">
          <div className="rounded-[2.5rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff0d4] p-10 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#2b2418]">
                  What Is Semantic Memory?
                </h2>
                <p className="mt-6 text-lg leading-8 text-[#5f5545]">
                  Instead of replaying entire chat logs, Synapse stores meaning —
                  identity, goals, projects, preferences — and retrieves only what
                  matters for the current question. That reduces noise, improves
                  relevance, and makes AI feel like it truly knows you.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  'Identity & preferences persist across sessions',
                  'Category-aware retrieval (goals, projects, skills)',
                  'Importance, recency, and rerank scores combined',
                  'Human-readable output for apps and agents',
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 rounded-2xl border border-yellow-100 bg-white/80 px-5 py-4"
                  >
                    <Sparkles className="mt-1 h-5 w-5 text-amber-700" />
                    <span className="text-[#5f5545]">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* STACK FEATURES */}
        <section className="pb-28">
          <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
            Built for Perceived Intelligence
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
            The difference between “random RAG” and “wow, it remembers me” is
            retrieval quality — embeddings, reranking, caching, and UX.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {stackFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_8px_40px_rgba(255,220,120,0.10)]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                    <Icon className="h-7 w-7 text-amber-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    {feature.title}
                  </h3>
                  <p className="mt-4 leading-8 text-[#5f5545]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 font-semibold text-[#3b3210] shadow-lg"
            >
              <Zap className="h-5 w-5" />
              Try Semantic Retrieval
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white px-8 py-3 font-semibold text-[#5a4b33]"
            >
              <Network className="h-5 w-5" />
              Integration Docs
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-8 py-3 font-semibold text-amber-800"
            >
              <ShieldCheck className="h-5 w-5" />
              Pricing & Limits
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
