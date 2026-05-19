'use client';

import Link from 'next/link';
import {
  Brain,
  Database,
  Sparkles,
  ShieldCheck,
  Workflow,
  Cpu,
  User,
  ArrowRight,
  Bot,
  Network,
  Layers3,
  CheckCircle2,
} from 'lucide-react';

const problems = [
  {
    icon: Database,
    text: 'Fragmented memory across AI systems',
  },
  {
    icon: Workflow,
    text: 'Repeated prompting and context rebuilding',
  },
  {
    icon: Layers3,
    text: 'Disconnected model interactions',
  },
  {
    icon: Cpu,
    text: 'Expensive token and compute waste',
  },
];

const features = [
  {
    icon: Brain,
    title: 'Semantic Memory Storage',
    description:
      'Persistent memory that understands relationships, meaning, and evolving context.',
  },
  {
    icon: Sparkles,
    title: 'Intelligent Retrieval',
    description:
      'Retrieve only the most relevant memories using semantic similarity search.',
  },
  {
    icon: User,
    title: 'User Personalization',
    description:
      'Adaptive user profiles that evolve with conversations and preferences.',
  },
  {
    icon: Network,
    title: 'Cross-Model Continuity',
    description:
      'Maintain continuity across GPT, Claude, Gemini, Ollama, Hugging Face, and future AI systems.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Memory Layer',
    description:
      'Encrypted identity and memory orchestration for secure AI experiences.',
  },
  {
    icon: Cpu,
    title: 'Context Optimization',
    description:
      'Reduce token usage while maximizing intelligence and response quality.',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] text-[#2b2418]">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[500px] w-[500px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-10 sm:px-10">
        {/* HERO */}
        <section className="pt-12 sm:pt-20">
          <div className="overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl">
            <div className="grid items-center gap-14 p-8 lg:grid-cols-2 lg:p-16">
              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold tracking-wide text-amber-800">
                  <Brain className="h-4 w-4" />
                  Synapse Intelligence
                </div>

                <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#2b2418] sm:text-7xl">
                  The Cognitive Memory Layer For AI
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5f5545] sm:text-xl">
                  Synapse enables persistent semantic memory, adaptive context,
                  and intelligent personalization between users and multiple AI
                  models, including OpenAI, Claude, Ollama, Hugging Face, and
                  custom personal deployments.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/docs"
                    className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-white/70 px-8 py-3 text-sm font-semibold text-[#5a4b33] transition-all duration-300 hover:bg-yellow-50"
                  >
                    View Documentation
                  </Link>
                </div>
              </div>

              {/* RIGHT DIAGRAM */}
              <div className="relative">
                <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffef8] to-[#fff6df] p-8 shadow-inner">
                  <div className="flex flex-col items-center gap-10">
                    {/* WITHOUT SYNAPSE */}
                    <div className="w-full rounded-3xl border border-red-100 bg-red-50/70 p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2">
                          <Bot className="h-5 w-5 text-red-500" />
                        </div>

                        <h3 className="text-lg font-semibold text-[#2b2418]">
                          Without Synapse
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl bg-white/80 p-4 text-sm text-[#5f5545] shadow-sm">
                          User repeats context to every AI model separately
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {['GPT', 'Claude', 'Ollama'].map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-red-100 bg-white px-4 py-5 text-center text-sm font-medium text-[#4d4333]"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* WITH SYNAPSE */}
                    <div className="w-full rounded-3xl border border-yellow-200 bg-yellow-50/70 p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-full bg-yellow-100 p-2">
                          <Brain className="h-5 w-5 text-amber-700" />
                        </div>

                        <h3 className="text-lg font-semibold text-[#2b2418]">
                          With Synapse Intelligence
                        </h3>
                      </div>

                      <div className="flex flex-col items-center gap-5">
                        {/* USER */}
                        <div className="rounded-2xl border border-yellow-200 bg-white px-6 py-4 shadow-sm">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#4d4333]">
                            <User className="h-4 w-4" />
                            User
                          </div>
                        </div>

                        {/* SYNAPSE */}
                        <div className="rounded-3xl border border-yellow-300 bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] px-8 py-6 shadow-lg">
                          <div className="flex items-center gap-3">
                            <Brain className="h-7 w-7 text-amber-800" />

                            <div>
                              <h4 className="font-semibold text-[#2b2418]">
                                Synapse
                              </h4>

                              <p className="text-xs text-[#5f5545]">
                                Shared Semantic Intelligence Layer
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* MODELS */}
                        <div className="grid w-full grid-cols-3 gap-3">
                          {['Gemini', 'Hugging Face', 'Custom'].map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-yellow-200 bg-white px-4 py-5 text-center text-sm font-medium text-[#4d4333] shadow-sm"
                            >
                              {item}
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl bg-white/80 p-4 text-center text-sm text-[#5f5545] shadow-sm">
                          All models share memory, preferences, context, and
                          continuity through Synapse
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEMS */}
        <section className="py-24">
          <div className="mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
              Why Synapse Exists
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
              Modern AI systems are intelligent individually, but disconnected
              collectively.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {problems.map((problem) => {
              const Icon = problem.icon;

              return (
                <div
                  key={problem.text}
                  className="rounded-[1.8rem] border border-yellow-200/40 bg-white/75 p-7 shadow-[0_8px_30px_rgba(255,220,120,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                    <Icon className="h-7 w-7 text-amber-700" />
                  </div>

                  <p className="leading-7 text-[#5f5545]">{problem.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES */}
        <section className="pb-28">
          <div className="mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
              Synapse Capabilities
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
              Designed as a universal intelligence layer between users and AI
              systems.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_8px_40px_rgba(255,220,120,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-md">
                    <Icon className="h-8 w-8 text-amber-800" />
                  </div>

                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-8 text-[#5f5545]">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-amber-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Production Ready
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}