'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import type {
  PlanConfig,
  PlanName,
} from '@/lib/plan-config';

import {
  Activity,
  AlertTriangle,
  Brain,
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  Lock,
  Mail,
  MemoryStick,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
  createdAt: string;
};

type DeveloperPlan = PlanConfig;

type DeveloperUsage = {
  plan: DeveloperPlan;
  usage: {
    minute: {
      limit: number;
      count: number;
      remaining: number;
      resetAt: string;
    };
    day: {
      limit: number;
      count: number;
      remaining: number;
      resetAt: string | null;
    };
    monthly: {
      addRequests: {
        limit: number | null;
        count: number;
        remaining: number | null;
        resetAt: string | null;
      };
      retrievalRequests: {
        limit: number | null;
        count: number;
        remaining: number | null;
        resetAt: string | null;
      };
    };
    activeMemories: {
      limit: number | null;
      count: number;
      remaining: number | null;
    };
  };
  projectCount: number;
  activeKeys: number;
};

type DeveloperKey = {
  _id?: string;
  id?: string;
  name: string;
  namespace: string;
  prefix: string;
  lastFour: string;
  isActive?: boolean;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
};

type RuntimeState =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'success'
  | 'error';

function getInitials(
  name: string
) {
  return name
    .split(' ')
    .map((part) =>
      part[0]?.toUpperCase()
    )
    .slice(0, 2)
    .join('');
}

function formatLimitValue(
  value: number | null
) {
  if (value === null) {
    return 'Unlimited';
  }

  return value.toLocaleString();
}

export default function ProfileSettings() {
  const [user, setUser] =
    useState<UserProfile | null>(
      null
    );

  const [name, setName] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [runtimeState, setRuntimeState] =
    useState<RuntimeState>(
      'idle'
    );

  const [loading, setLoading] =
    useState(true);

  const [developerLoading, setDeveloperLoading] =
    useState(true);

  const [developerUsage, setDeveloperUsage] =
    useState<DeveloperUsage | null>(
      null
    );

  const [apiKeys, setApiKeys] =
    useState<DeveloperKey[]>([]);

  const [apiKeyName, setApiKeyName] =
    useState('');

  const [apiKeyNamespace, setApiKeyNamespace] =
    useState('synapse-web');

  const [apiKeyStatus, setApiKeyStatus] =
    useState('');

  const [createdSecret, setCreatedSecret] =
    useState('');

  const [creatingKey, setCreatingKey] =
    useState(false);

  const [planSwitching, setPlanSwitching] =
    useState<PlanName | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const userInitials =
    useMemo(() => {
      return getInitials(
        user?.name || 'S'
      );
    }, [user]);

  async function fetchProfile() {
    setLoading(true);

    setRuntimeState(
      'loading'
    );

    setStatus(
      'Loading cognitive identity profile...'
    );

    try {
      const response =
        await fetch(
          '/api/auth/me',
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
            'Unable to load profile.'
        );
      }

      setUser(data.user);

      setName(
        data.user.name
      );

      setRuntimeState(
        'success'
      );

      setStatus(
        'Identity profile loaded successfully.'
      );
    } catch (
      err: unknown
    ) {
      setRuntimeState(
        'error'
      );

      setStatus(
        err instanceof Error
          ? err.message
          : 'Unable to load profile.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeveloperAccess() {
    setDeveloperLoading(true);

    try {
      const [usageResponse, keysResponse] =
        await Promise.all([
          fetch(
            '/api/developer/usage',
            {
              cache:
                'no-store',
            }
          ),
          fetch(
            '/api/developer/keys',
            {
              cache:
                'no-store',
            }
          ),
        ]);

      const usageData =
        await usageResponse.json();
      const keysData =
        await keysResponse.json();

      if (!usageResponse.ok) {
        throw new Error(
          usageData.error ||
            'Unable to load developer usage.'
        );
      }

      if (!keysResponse.ok) {
        throw new Error(
          keysData.error ||
            'Unable to load API keys.'
        );
      }

      setDeveloperUsage(
        usageData
      );
      setApiKeys(
        keysData.keys || []
      );
    } catch (
      err: unknown
    ) {
      setApiKeyStatus(
        err instanceof Error
          ? err.message
          : 'Unable to load developer access.'
      );
    } finally {
      setDeveloperLoading(false);
    }
  }

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void fetchProfile();
        void fetchDeveloperAccess();
      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) return;

    setSaving(true);

    setRuntimeState(
      'saving'
    );

    setStatus(
      'Updating cognitive identity...'
    );

    try {
      const response =
        await fetch(
          '/api/auth/profile',
          {
            method:
              'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              {
                name,
                password:
                  password ||
                  undefined,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to update profile.'
        );
      }

      setUser({
        ...user,
        name,
      });

      setPassword('');

      setRuntimeState(
        'success'
      );

      setStatus(
        'Cognitive identity updated successfully.'
      );
    } catch (
      err: unknown
    ) {
      setRuntimeState(
        'error'
      );

      setStatus(
        err instanceof Error
          ? err.message
          : 'Profile update failed.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateKey() {
    if (!apiKeyName.trim() || !apiKeyNamespace.trim()) {
      setApiKeyStatus(
        'API key name and namespace are required.'
      );
      return;
    }

    setCreatingKey(true);
    setApiKeyStatus(
      'Creating developer API key...'
    );
    setCreatedSecret('');

    try {
      const response =
        await fetch(
          '/api/developer/keys',
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              {
                name: apiKeyName,
                namespace:
                  apiKeyNamespace,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to create API key.'
        );
      }

      setCreatedSecret(
        data.secret
      );
      setApiKeyName('');
      setApiKeyStatus(
        'API key created. Copy the secret now, it will not be shown again.'
      );

      await fetchDeveloperAccess();
    } catch (
      err: unknown
    ) {
      setApiKeyStatus(
        err instanceof Error
          ? err.message
          : 'Unable to create API key.'
      );
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(
    keyId: string
  ) {
    setApiKeyStatus(
      'Revoking API key...'
    );

    try {
      const response =
        await fetch(
          `/api/developer/keys/${keyId}`,
          {
            method:
              'DELETE',
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to revoke API key.'
        );
      }

      setApiKeyStatus(
        'API key revoked successfully.'
      );
      setCreatedSecret('');
      await fetchDeveloperAccess();
    } catch (
      err: unknown
    ) {
      setApiKeyStatus(
        err instanceof Error
          ? err.message
          : 'Unable to revoke API key.'
      );
    }
  }

  async function copySecret(
    value: string
  ) {
    try {
      await navigator.clipboard.writeText(
        value
      );
      setApiKeyStatus(
        'API key copied to clipboard.'
      );
    } catch {
      setApiKeyStatus(
        'Unable to copy API key automatically.'
      );
    }
  }

  async function handleChangePlan(
    plan: PlanName
  ) {
    setPlanSwitching(plan);
    setApiKeyStatus(
      `Switching account to ${plan} plan...`
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
              {
                plan,
              }
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to change plan.'
        );
      }

      setUser((current) =>
        current
          ? {
              ...current,
              plan:
                data.user.plan,
            }
          : current
      );
      setApiKeyStatus(
        data.message ||
          'Plan updated successfully.'
      );
      await fetchDeveloperAccess();
    } catch (
      err: unknown
    ) {
      setApiKeyStatus(
        err instanceof Error
          ? err.message
          : 'Unable to change plan.'
      );
    } finally {
      setPlanSwitching(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] px-6 py-10 sm:px-10">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_25px_90px_rgba(255,210,90,0.18)] backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr]">
          {/* LEFT PANEL */}
          <div className="relative hidden overflow-hidden border-r border-yellow-200/40 bg-gradient-to-br from-[#fff8e7] via-[#fff6df] to-[#ffefc8] p-14 lg:flex lg:flex-col">
            {/* Glow */}
            <div className="absolute right-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-yellow-200/40 blur-3xl" />

            {/* BRAND */}
            <div className="relative flex items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-white p-2 shadow-md shadow-yellow-200/40">
                <Image
                  src="/synapse.png"
                  alt="Synapse Logo"
                  width={54}
                  height={54}
                  priority
                  unoptimized
                  className="h-12 w-12 object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2b2418]">
                  Synapse
                </h1>

                <p className="text-xs uppercase tracking-[0.32em] text-amber-700/70">
                  Cognitive Runtime
                </p>
              </div>
            </div>

            {/* HERO */}
            <div className="relative mt-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/60 px-4 py-2 text-sm font-semibold text-amber-800">
                <Sparkles className="h-4 w-4" />
                Cognitive Identity Layer
              </div>

              <h2 className="mt-8 text-5xl font-bold leading-tight tracking-tight text-[#2b2418]">
                Persistent Identity &
                Intelligence
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-[#5f5545]">
                Manage your Synapse
                identity, cognitive
                continuity, and secure
                authentication across your
                semantic memory runtime.
              </p>
            </div>

            {/* FEATURE STACK */}
            <div className="relative mt-14 space-y-5">
              {[
                {
                  icon: Brain,
                  title:
                    'Persistent Cognitive Identity',
                  desc:
                    'Long-term semantic continuity across your intelligence runtime.',
                },
                {
                  icon: ShieldCheck,
                  title:
                    'Secure Runtime Authentication',
                  desc:
                    'Protected credentials and secure cognitive access control.',
                },
                {
                  icon: MemoryStick,
                  title:
                    'Memory Continuity',
                  desc:
                    'Connected retrieval and personalized intelligence state.',
                },
              ].map((item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.title
                    }
                    className="flex items-start gap-4 rounded-3xl border border-yellow-200/50 bg-white/70 p-5 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-sm">
                      <Icon className="h-7 w-7 text-amber-800" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#2b2418]">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-1 leading-7 text-[#5f5545]">
                        {
                          item.desc
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RUNTIME METRICS */}
            <div className="mt-auto grid gap-4 sm:grid-cols-2">
              {[
                {
                  label:
                    'Runtime',
                  value:
                    'Online',
                  icon: Activity,
                },
                {
                  label:
                    'Identity',
                  value:
                    'Persistent',
                  icon: Zap,
                },
              ].map((item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.label
                    }
                    className="rounded-3xl border border-yellow-200/40 bg-white/60 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7b6f5c]">
                          {
                            item.label
                          }
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#2b2418]">
                          {
                            item.value
                          }
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">
                        <Icon className="h-6 w-6 text-amber-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative p-8 sm:p-12 lg:p-14">
            {/* TOP LINE */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />

            {/* MOBILE BRAND */}
            <div className="mb-10 flex items-center gap-4 lg:hidden">
              <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-white p-2 shadow-md shadow-yellow-200/40">
                <Image
                  src="/synapse.png"
                  alt="Synapse Logo"
                  width={46}
                  height={46}
                  className="h-11 w-11 object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2b2418]">
                  Synapse
                </h1>

                <p className="text-xs uppercase tracking-[0.3em] text-amber-700/70">
                  Cognitive Runtime
                </p>
              </div>
            </div>

            {/* PROFILE HEADER */}
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-amber-800">
                  <User className="h-4 w-4" />
                  Cognitive Identity
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#2b2418]">
                  Profile Settings
                </h2>

                <p className="mt-4 max-w-xl text-lg leading-8 text-[#5f5545]">
                  Manage your Synapse
                  account, runtime
                  security, and persistent
                  cognitive identity.
                </p>
              </div>

              {/* USER CARD */}
              <div className="rounded-[2rem] border border-yellow-200/50 bg-gradient-to-br from-[#fffdf7] to-[#fff5dd] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] text-2xl font-bold text-[#3b3210] shadow-md">
                    {
                      userInitials
                    }
                  </div>

                  <div>
                    <p className="text-sm text-[#7b6f5c]">
                      Active Identity
                    </p>

                    <h3 className="text-2xl font-bold text-[#2b2418]">
                      {user?.name ||
                        'Synapse User'}
                    </h3>

                    <p className="mt-1 text-sm text-[#7b6f5c]">
                      Cognitive runtime
                      active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="mt-12 rounded-[2rem] border border-yellow-100 bg-yellow-50/60 p-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-amber-500" />

                  <div>
                    <p className="text-lg font-semibold text-[#2b2418]">
                      Loading cognitive
                      identity...
                    </p>

                    <p className="mt-1 text-[#7b6f5c]">
                      Syncing profile and
                      runtime state.
                    </p>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="mt-12 space-y-8">
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-7"
                >
                {/* NAME */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    Full Name
                  </label>

                  <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                    <User className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type="text"
                      value={name}
                      onChange={(
                        event
                      ) =>
                        setName(
                          event
                            .target
                            .value
                        )
                      }
                      required
                      className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    Email Address
                  </label>

                  <div className="flex items-center rounded-2xl border border-yellow-100 bg-[#fff9ef] px-4">
                    <Mail className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type="email"
                      value={
                        user.email
                      }
                      disabled
                      className="w-full bg-transparent px-4 py-4 text-[#7b6f5c] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-sm text-[#8a7c66]">
                    Email identity is
                    immutable for runtime
                    consistency.
                  </p>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    Runtime Password
                  </label>

                  <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                    <Lock className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            prev
                          ) =>
                            !prev
                        )
                      }
                      className="text-[#8b7c63] transition hover:text-[#2b2418]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ACCOUNT METRICS */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-6">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-6 w-6 text-amber-700" />

                      <div>
                        <p className="text-sm text-[#7b6f5c]">
                          Member Since
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#2b2418]">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-6">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-amber-700" />

                      <div>
                        <p className="text-sm text-[#7b6f5c]">
                          Runtime Status
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#2b2418]">
                          Secured
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                {status && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm ${
                      runtimeState ===
                      'success'
                        ? 'border border-green-200 bg-green-50 text-green-700'
                        : runtimeState ===
                          'error'
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-yellow-200 bg-yellow-50 text-amber-700'
                    }`}
                  >
                    {runtimeState ===
                    'success' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />
                    ) : runtimeState ===
                      'error' ? (
                      <AlertTriangle className="mt-0.5 h-5 w-5" />
                    ) : (
                      <Activity className="mt-0.5 h-5 w-5" />
                    )}

                    <span>
                      {status}
                    </span>
                  </div>
                )}

                {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-6 py-4 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.01] hover:from-[#fff0ba] hover:to-[#ffe08d] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3b3210]/30 border-t-[#3b3210]" />
                        Updating Identity...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Save Cognitive Profile
                      </>
                    )}
                  </button>
                </form>

                <section className="rounded-[2rem] border border-yellow-200/60 bg-gradient-to-br from-[#fffdf7] via-white to-[#fff6df] p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-amber-800">
                        <KeyRound className="h-4 w-4" />
                        Developer Access
                      </div>

                      <h3 className="mt-4 text-2xl font-bold text-[#2b2418]">
                        Usage Controls, Quotas, and Plans
                      </h3>

                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6e624f]">
                        Each namespace key inherits your current plan limits for projects, active memories, monthly usage, and request velocity.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 rounded-3xl border border-yellow-200/60 bg-white/80 px-5 py-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8a7c66]">
                          Active Plan
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#2b2418]">
                          {developerUsage?.plan.label ||
                            user.plan}
                        </p>
                      </div>

                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-yellow-100"
                      >
                        Compare Plans
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Layers3 className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            API Keys
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.activeKeys}/${developerUsage.plan.maxApiKeys}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            Active Memories
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.usage.activeMemories.count}/${formatLimitValue(
                                  developerUsage.usage.activeMemories.limit
                                )}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            Projects
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.projectCount}/${formatLimitValue(
                                  developerUsage.plan.maxProjects
                                )}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            Per Minute
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.usage.minute.count}/${developerUsage.usage.minute.limit}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            Monthly Adds
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.usage.monthly.addRequests.count}/${formatLimitValue(
                                  developerUsage.usage.monthly.addRequests.limit
                                )}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-5">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-amber-700" />
                        <div>
                          <p className="text-sm text-[#7b6f5c]">
                            Monthly Retrievals
                          </p>
                          <p className="mt-1 text-xl font-semibold text-[#2b2418]">
                            {developerUsage
                              ? `${developerUsage.usage.monthly.retrievalRequests.count}/${formatLimitValue(
                                  developerUsage.usage.monthly.retrievalRequests.limit
                                )}`
                              : '--'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-yellow-100 bg-white/90 p-5">
                      <div className="rounded-2xl border border-yellow-100 bg-[#fffaf0] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#2b2418]">
                              Plan controls
                            </p>
                            <p className="mt-1 text-xs leading-6 text-[#7b6f5c]">
                              Upgrade immediately if you need more namespaces, active memories, or monthly request headroom.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                'hobby',
                                'pro',
                                'growth',
                                'scale',
                                'enterprise',
                              ] as PlanName[]
                            ).map((planName) => {
                              const isCurrent =
                                developerUsage?.plan.name ===
                                  planName ||
                                user.plan ===
                                  planName;

                              return (
                                <button
                                  key={planName}
                                  type="button"
                                  disabled={
                                    planSwitching !==
                                    null
                                  }
                                  onClick={() =>
                                    void handleChangePlan(
                                      planName
                                    )
                                  }
                                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                    isCurrent
                                      ? 'bg-[#2b2418] text-[#fff4c7]'
                                      : 'border border-yellow-200 bg-white text-[#5a4b33] hover:bg-yellow-50'
                                  } disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                  {planSwitching ===
                                  planName
                                    ? 'Switching...'
                                    : planName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <h4 className="mt-5 text-lg font-semibold text-[#2b2418]">
                        Create API Key
                      </h4>

                      <div className="mt-4 space-y-4">
                        <input
                          type="text"
                          value={
                            apiKeyName
                          }
                          onChange={(
                            event
                          ) =>
                            setApiKeyName(
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Production key"
                          className="w-full rounded-2xl border border-yellow-200/70 bg-[#fffdf7] px-4 py-3 text-[#2b2418] outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-yellow-100"
                        />

                        <input
                          type="text"
                          value={
                            apiKeyNamespace
                          }
                          onChange={(
                            event
                          ) =>
                            setApiKeyNamespace(
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="your-app-namespace"
                          className="w-full rounded-2xl border border-yellow-200/70 bg-[#fffdf7] px-4 py-3 text-[#2b2418] outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-yellow-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            void handleCreateKey()
                          }
                          disabled={
                            creatingKey
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2418] px-5 py-3 text-sm font-semibold text-[#fff4c7] transition hover:bg-[#3c321f] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {creatingKey ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#fff4c7]/30 border-t-[#fff4c7]" />
                              Creating Key...
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-4 w-4" />
                              Generate Namespace Key
                            </>
                          )}
                        </button>
                      </div>

                      {createdSecret && (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
                          <p className="text-sm font-semibold">
                            Copy this key now
                          </p>
                          <p className="mt-2 break-all font-mono text-xs">
                            {createdSecret}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              void copySecret(
                                createdSecret
                              )
                            }
                            className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-300 px-4 py-2 text-xs font-semibold transition hover:bg-green-100"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Secret
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-yellow-100 bg-white/90 p-5">
                      <h4 className="text-lg font-semibold text-[#2b2418]">
                        Active Keys
                      </h4>

                      {developerLoading ? (
                        <div className="mt-4 text-sm text-[#7b6f5c]">
                          Loading developer access...
                        </div>
                      ) : apiKeys.length ? (
                        <div className="mt-4 space-y-3">
                          {apiKeys.map(
                            (key) => {
                              const keyId =
                                key._id ||
                                key.id;

                              return (
                                <div
                                  key={
                                    keyId
                                  }
                                  className="rounded-2xl border border-yellow-100 bg-[#fffaf0] p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="font-semibold text-[#2b2418]">
                                        {
                                          key.name
                                        }
                                      </p>
                                      <p className="mt-1 font-mono text-xs text-[#7b6f5c]">
                                        {
                                          key.prefix
                                        }
                                        ****
                                        {
                                          key.lastFour
                                        }
                                      </p>
                                      <p className="mt-2 text-xs text-[#8a7c66]">
                                        Namespace:{' '}
                                        {
                                          key.namespace
                                        }
                                      </p>
                                      <p className="mt-1 text-xs text-[#8a7c66]">
                                        Last used:{' '}
                                        {key.lastUsedAt
                                          ? new Date(
                                              key.lastUsedAt
                                            ).toLocaleString()
                                          : 'Never'}
                                      </p>
                                    </div>

                                    {keyId ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleRevokeKey(
                                            keyId
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Revoke
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-yellow-200 bg-[#fffaf0] p-4 text-sm text-[#7b6f5c]">
                          No API keys created yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {apiKeyStatus && (
                    <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-amber-800">
                      {apiKeyStatus}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load profile
                information.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
