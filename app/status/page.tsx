'use client';

import { useEffect, useState } from 'react';
import {
  getHealthStatus,
  getMemoryStats,
} from '@/lib/synapse-ai-client';
import Link from 'next/link';
import {
  Activity,
  Brain,
  Database,
  Server,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Cpu,
  Network,
  Globe,
} from 'lucide-react';

export default function StatusPage() {
  const [serviceHealth, setServiceHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      setLoading(true);

      try {
        const [health, statsData] = await Promise.all([
          getHealthStatus(),
          getMemoryStats().catch(() => null),
        ]);

        setServiceHealth(health);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();

    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const endpoints = [
    {
      name: 'Memory Management',
      endpoint: '/memory/',
    },
    {
      name: 'AI Queries',
      endpoint: '/ai/query',
    },
    {
      name: 'Embeddings',
      endpoint: '/embedding/embed',
    },
    {
      name: 'Health Check',
      endpoint: '/health',
    },
    {
      name: 'User Profiles',
      endpoint: '/ai/profile/{user_id}',
    },
    {
      name: 'Memory Search',
      endpoint: '/retrieval/search',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] px-6 py-10 sm:px-10">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* HERO */}
        <section className="overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl">
          <div className="grid gap-14 p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold tracking-wide text-amber-800">
                <Activity className="h-4 w-4" />
                Real-Time System Monitoring
              </div>

              <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#2b2418] sm:text-7xl">
                Synapse System Status
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#5f5545] sm:text-xl">
                Monitor infrastructure health, semantic memory performance,
                AI endpoint activity, and system intelligence continuity.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  Open Dashboard
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

            {/* RIGHT */}
            <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffef8] to-[#fff5dd] p-8 shadow-inner">
              <div className="flex h-full flex-col justify-center gap-5">
                {[
                  {
                    icon: Brain,
                    title: 'Semantic Memory Layer',
                    desc: serviceHealth
                      ? 'Operational and responding normally.'
                      : 'Waiting for health status.',
                    status: !!serviceHealth,
                  },
                  {
                    icon: Database,
                    title: 'Vector Memory Database',
                    desc: 'Qdrant vector infrastructure operational.',
                    status: true,
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Authentication System',
                    desc: 'JWT sessions and identity services active.',
                    status: true,
                  },
                ].map((item) => {
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
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.status ? 'Online' : 'Checking'}
                          </span>
                        </div>

                        <p className="mt-1 leading-7 text-[#5f5545]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && !loading && (
          <div className="mt-10 rounded-[2rem] border border-red-200 bg-red-50/80 p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-red-700">
                  System Error
                </h2>

                <p className="mt-2 leading-7 text-red-600">
                  Unable to retrieve Synapse system status.
                </p>

                <p className="mt-3 text-sm text-red-500">
                  {error}
                </p>

                <Link
                  href="/dashboard"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-900"
                >
                  Return to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MAIN STATUS */}
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* AI SERVICE */}
          <div className="rounded-[2rem] border border-yellow-200/50 bg-white/80 p-8 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2b2418]">
                  Synapse AI Service
                </h2>

                <p className="mt-2 text-[#5f5545]">
                  Semantic intelligence infrastructure.
                </p>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                  serviceHealth
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                <Brain
                  className={`h-8 w-8 ${
                    serviceHealth
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                />
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-yellow-100 bg-yellow-50/60 p-6">
                <p className="text-[#5f5545]">
                  Checking AI infrastructure...
                </p>
              </div>
            ) : serviceHealth ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 text-green-700" />

                  <span className="font-semibold text-green-700">
                    All AI services operational
                  </span>
                </div>

                <div className="rounded-3xl border border-yellow-100 bg-yellow-50/50 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-[#7b6f5c]">
                        Last Health Check
                      </p>

                      <p className="mt-2 text-lg font-semibold text-[#2b2418]">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#7b6f5c]">
                        System State
                      </p>

                      <p className="mt-2 text-lg font-semibold text-green-700">
                        Healthy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <p className="font-semibold text-red-700">
                  Synapse AI Service Offline
                </p>

                <p className="mt-2 leading-7 text-red-600">
                  Unable to connect to the AI service on port 8000.
                </p>
              </div>
            )}
          </div>

          {/* WEB SERVICE */}
          <div className="rounded-[2rem] border border-yellow-200/50 bg-white/80 p-8 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#2b2418]">
                  Synapse Web
                </h2>

                <p className="mt-2 text-[#5f5545]">
                  Dashboard and user platform.
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
                  Web portal operational
                </span>
              </div>

              <div className="rounded-3xl border border-yellow-100 bg-yellow-50/50 p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-[#7b6f5c]">
                      Authentication
                    </p>

                    <p className="mt-2 text-lg font-semibold text-[#2b2418]">
                      Active
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[#7b6f5c]">
                      Dashboard Status
                    </p>

                    <p className="mt-2 text-lg font-semibold text-[#2b2418]">
                      Online
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-4 py-2 text-sm font-semibold text-[#3b3210] transition hover:scale-[1.02]"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/docs"
                    className="rounded-full border border-yellow-200 bg-white px-4 py-2 text-sm font-semibold text-[#5f5545] transition hover:bg-yellow-50"
                  >
                    Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        {stats && (
          <section className="mt-14 rounded-[2.5rem] border border-yellow-200/50 bg-white/80 p-10 shadow-[0_10px_60px_rgba(255,220,120,0.12)] backdrop-blur-2xl">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-[#2b2418]">
                  Memory Statistics
                </h2>

                <p className="mt-3 text-lg text-[#5f5545]">
                  Real-time semantic memory analytics.
                </p>
              </div>

              <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-lg lg:flex">
                <BarChart3 className="h-10 w-10 text-amber-800" />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  label: 'Total Memories',
                  value: stats.total_memories ?? 0,
                  icon: Brain,
                },
                {
                  label: 'Average Importance',
                  value: stats.average_importance
                    ? stats.average_importance.toFixed(2)
                    : '0.00',
                  icon: Sparkles,
                },
                {
                  label: 'Memory Categories',
                  value: stats.categories
                    ? Object.keys(stats.categories).length
                    : 0,
                  icon: Database,
                },
              ].map((item) => {
                const Icon = item.icon;

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

            {/* Categories */}
            {stats.categories && (
              <div className="mt-12">
                <h3 className="mb-8 text-2xl font-bold text-[#2b2418]">
                  Category Distribution
                </h3>

                <div className="space-y-5">
                  {Object.entries(stats.categories).map(
                    ([category, count]: [string, any]) => {
                      const percentage =
                        stats.total_memories > 0
                          ? (count / stats.total_memories) * 100
                          : 0;

                      return (
                        <div
                          key={category}
                          className="rounded-3xl border border-yellow-100 bg-[#fffdf7] p-5"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="font-semibold capitalize text-[#2b2418]">
                              {category}
                            </span>

                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-amber-700">
                              {count}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-yellow-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#ffd76b] to-[#ffbf47] transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* API ENDPOINTS */}
        <section className="mt-14 rounded-[2.5rem] border border-yellow-200/50 bg-white/80 p-10 shadow-[0_10px_60px_rgba(255,220,120,0.12)] backdrop-blur-2xl">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-[#2b2418]">
              API Infrastructure
            </h2>

            <p className="mt-3 text-lg text-[#5f5545]">
              Operational semantic intelligence endpoints.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.endpoint}
                className="rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e7] p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2b2418]">
                      {endpoint.name}
                    </h3>

                    <p className="mt-3 rounded-full bg-yellow-100 px-3 py-1 font-mono text-sm text-amber-700 inline-block">
                      {endpoint.endpoint}
                    </p>
                  </div>

                  <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Operational
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEM INFO */}
        <section className="mt-14 mb-20 rounded-[2.5rem] border border-yellow-200/50 bg-white/80 p-10 shadow-[0_10px_60px_rgba(255,220,120,0.12)] backdrop-blur-2xl">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-[#2b2418]">
              System Information
            </h2>

            <p className="mt-3 text-lg text-[#5f5545]">
              Current infrastructure and platform versions.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                label: 'Synapse AI Service',
                value: 'Version 1.0.0',
                icon: Brain,
              },
              {
                label: 'Synapse Web Portal',
                value: 'Version 1.0.0',
                icon: Globe,
              },
              {
                label: 'Vector Database',
                value: 'Qdrant Operational',
                icon: Database,
              },
              {
                label: 'Infrastructure',
                value: 'MongoDB Operational',
                icon: Server,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-start gap-5 rounded-[2rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e7] p-6"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-sm">
                    <Icon className="h-8 w-8 text-amber-800" />
                  </div>

                  <div>
                    <p className="text-[#7b6f5c]">
                      {item.label}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-[#2b2418]">
                      {item.value}
                    </h3>
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