'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  EARLY_ROLLOUT_NOTICE,
  formatPlanLimit,
  OVERAGE_PRICING,
  PLAN_CONFIGS,
  PLAN_ORDER,
  type PlanName,
} from '@/lib/plan-config';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
};

export default function PricingPage() {
  const [user, setUser] =
    useState<SessionUser | null>(
      null
    );
  const [loading, setLoading] =
    useState<PlanName | null>(null);
  const [status, setStatus] =
    useState('');

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response =
          await fetch('/api/auth/me', {
            cache: 'no-store',
          });

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (active) {
          setUser(data.user ?? null);
        }
      } catch {}
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleSelectPlan(
    plan: PlanName
  ) {
    setLoading(plan);
    setStatus(
      `Activating ${PLAN_CONFIGS[plan].label}...`
    );

    try {
      const response =
        await fetch(
          '/api/billing/plan',
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              { plan }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to update plan.'
        );
      }

      setUser(data.user);
      setStatus(
        data.message ||
          'Plan updated successfully.'
      );
    } catch (
      err: unknown
    ) {
      setStatus(
        err instanceof Error
          ? err.message
          : 'Unable to update plan.'
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] px-6 py-16 text-[#2b2418] sm:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] h-[360px] w-[360px] rounded-full bg-amber-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <section className="rounded-[2.8rem] border border-yellow-200/50 bg-white/85 p-8 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl lg:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-amber-800">
              <Sparkles className="h-4 w-4" />
              Synapse Pricing
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Usage-aware plans built for memory-heavy AI apps
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#5f5545]">
              Synapse enforces monthly add and retrieval quotas, active memory ceilings, project caps, and request-rate controls to keep the platform performant, scalable, and abuse-resistant.
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-yellow-200 bg-[#fffaf0] p-5 text-sm leading-7 text-[#6e624f]">
            {EARLY_ROLLOUT_NOTICE}
          </div>

          {status && (
            <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-amber-800">
              {status}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-5">
          {PLAN_ORDER.map((planName) => {
            const plan =
              PLAN_CONFIGS[planName];
            const isCurrent =
              user?.plan === plan.name;

            return (
              <article
                key={plan.name}
                className={`flex h-full flex-col rounded-[2rem] border p-6 shadow-[0_12px_40px_rgba(255,220,120,0.10)] ${
                  isCurrent
                    ? 'border-[#2b2418] bg-[#2b2418] text-[#fff4c7]'
                    : 'border-yellow-200/50 bg-white/85'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm uppercase tracking-[0.24em] ${
                        isCurrent
                          ? 'text-[#fff4c7]/70'
                          : 'text-[#8a7c66]'
                      }`}
                    >
                      {plan.bestFor}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold">
                      {plan.label}
                    </h2>
                  </div>

                  {isCurrent && (
                    <span className="rounded-full border border-[#fff4c7]/30 px-3 py-1 text-xs font-semibold">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-6 text-4xl font-bold">
                  {plan.priceLabel}
                </p>

                <div
                  className={`mt-6 rounded-3xl border p-4 text-sm ${
                    isCurrent
                      ? 'border-[#fff4c7]/20 bg-white/5'
                      : 'border-yellow-100 bg-[#fffaf0]'
                  }`}
                >
                  <p>
                    Active memories:{' '}
                    {formatPlanLimit(
                      plan.maxActiveMemories
                    )}
                  </p>
                  <p className="mt-2">
                    Add requests / month:{' '}
                    {formatPlanLimit(
                      plan.monthlyAddRequests
                    )}
                  </p>
                  <p className="mt-2">
                    Retrievals / month:{' '}
                    {formatPlanLimit(
                      plan.monthlyRetrievalRequests
                    )}
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  {[
                    `${formatPlanLimit(plan.maxProjects)} projects`,
                    `${plan.maxApiKeys} active API keys`,
                    `${formatPlanLimit(plan.maxTeamMembers)} team members`,
                    `${plan.rateLimitPerMinute.toLocaleString()} req/min`,
                    `${plan.rateLimitPerDay.toLocaleString()} req/day`,
                    `${plan.analyticsDashboard} analytics`,
                  ].map((line) => (
                    <div
                      key={line}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex-1" />

                {user ? (
                  <button
                    type="button"
                    disabled={
                      loading !== null
                    }
                    onClick={() =>
                      void handleSelectPlan(
                        plan.name
                      )
                    }
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                      isCurrent
                        ? 'border border-[#fff4c7]/25 bg-white/10 text-[#fff4c7]'
                        : 'bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] text-[#3b3210] hover:scale-[1.01]'
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {loading ===
                    plan.name
                      ? 'Updating...'
                      : isCurrent
                      ? 'Current plan'
                      : `Choose ${plan.label}`}
                  </button>
                ) : (
                  <Link
                    href={
                      plan.name ===
                      'enterprise'
                        ? '/docs'
                        : '/register'
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-5 py-3 text-sm font-semibold text-[#3b3210] transition hover:scale-[1.01]"
                  >
                    {/* {plan.name ===
                    'enterprise'
                      ? 'Contact sales'
                      : 'Start building'} */}
                      {plan.name === 'enterprise'
? 'Contact sales'
: plan.name === 'scale'
? 'Power production AI'
: plan.name === 'growth'
? 'Scale your app'
: plan.name === 'pro'
? 'Upgrade to Pro'
: 'Start building'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            );
          })}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-yellow-200/50 bg-white/85 p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-bold">
                Abuse-resistant usage model
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                'Every developer request is rate-limited per minute and per day.',
                'Monthly add and retrieval quotas are enforced before proxying traffic.',
                'API keys are namespace-scoped to prevent cross-project misuse.',
                'Project caps are enforced from active namespaces, not just raw key count.',
                'Active memory ceilings stop runaway ingestion before infrastructure gets saturated.',
                'Deletes reconcile active-memory totals so teams can recover capacity cleanly.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-yellow-100 bg-[#fffaf0] px-5 py-4 text-sm leading-7 text-[#5f5545]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff0d4] p-8">
            <div className="flex items-center gap-3">
              <Layers3 className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-bold">
                Overage pricing
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {OVERAGE_PRICING.map(
                (item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-yellow-100 bg-white/80 px-4 py-3 text-sm"
                  >
                    <span className="text-[#5f5545]">
                      {item.label}
                    </span>
                    <span className="font-semibold text-[#2b2418]">
                      {item.price}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-yellow-100 bg-white/80 p-4 text-sm leading-7 text-[#5f5545]">
              <div className="flex items-center gap-2 font-semibold text-[#2b2418]">
                <Zap className="h-4 w-4 text-amber-700" />
                Early adopter note
              </div>
              <p className="mt-2">
                As Synapse scales and infrastructure efficiency improves, limits and platform benefits may expand over time to better support growing applications and early adopters.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
