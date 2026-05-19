'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  Brain,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function ProfileSettings() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/me');

      if (response.ok) {
        const data = await response.json();

        setUser(data.user);
        setName(data.user.name);
      } else {
        setStatus('Unable to load profile.');
      }
    } catch {
      setStatus('Something went wrong while loading profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) return;

    setSaving(true);
    setStatus('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Profile updated successfully.');
        setPassword('');
        setUser({
          ...user,
          name,
        });
      } else {
        setStatus(data.error || 'Unable to update profile.');
      }
    } catch {
      setStatus('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] px-6 py-10 sm:px-10">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_25px_90px_rgba(255,210,90,0.18)] backdrop-blur-2xl lg:grid-cols-[1fr_0.95fr]">
          {/* LEFT PANEL */}
          <div className="relative hidden overflow-hidden border-r border-yellow-200/40 bg-gradient-to-br from-[#fff8e7] via-[#fff6df] to-[#ffefc8] p-14 lg:flex lg:flex-col">
            {/* Glow */}
            <div className="absolute right-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-yellow-200/40 blur-3xl" />

            {/* Logo */}
            <div className="relative flex items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-white p-2 shadow-md shadow-yellow-200/40">
                <Image
                  src="/synapse.png"
                  alt="Synapse Logo"
                  width={50}
                  height={50}
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
                  Intelligence
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="relative mt-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/60 px-4 py-2 text-sm font-semibold text-amber-800">
                <Sparkles className="h-4 w-4" />
                Intelligent Identity Layer
              </div>

              <h2 className="mt-8 text-5xl font-bold leading-tight tracking-tight text-[#2b2418]">
                Your Cognitive AI Profile
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-[#5f5545]">
                Manage your Synapse identity, secure your account,
                and personalize your intelligent AI ecosystem.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="relative mt-14 space-y-5">
              {[
                {
                  icon: Brain,
                  title: 'Persistent Identity',
                  desc: 'Your memory and AI continuity stay connected.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure Authentication',
                  desc: 'Protected credentials and encrypted sessions.',
                },
                {
                  icon: Sparkles,
                  title: 'Personalized Intelligence',
                  desc: 'Adaptive AI experiences tailored to you.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-3xl border border-yellow-200/50 bg-white/70 p-5 shadow-sm backdrop-blur-md"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-sm">
                      <Icon className="h-7 w-7 text-amber-800" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#2b2418]">
                        {item.title}
                      </h3>

                      <p className="mt-1 leading-7 text-[#5f5545]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative p-8 sm:p-12 lg:p-14">
            {/* top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />

            {/* Mobile Logo */}
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
                  Intelligence
                </p>
              </div>
            </div>

            {/* Heading */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-amber-800">
                <User className="h-4 w-4" />
                Profile Settings
              </div>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#2b2418]">
                Manage Your Account
              </h2>

              <p className="mt-4 max-w-md text-lg leading-8 text-[#5f5545]">
                Update your profile information and security settings
                for your Synapse intelligence account.
              </p>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="mt-12 rounded-3xl border border-yellow-100 bg-yellow-50/60 p-8">
                <p className="text-lg text-[#5f5545]">
                  Loading profile...
                </p>
              </div>
            ) : user ? (
              <form
                onSubmit={handleSubmit}
                className="mt-12 space-y-6"
              >
                {/* Name */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    Full Name
                  </label>

                  <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                    <User className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                      className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    Email Address
                  </label>

                  <div className="flex items-center rounded-2xl border border-yellow-100 bg-[#fff9ef] px-4">
                    <Mail className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-transparent px-4 py-4 text-[#7b6f5c] outline-none"
                    />
                  </div>

                  <p className="mt-2 text-sm text-[#8a7c66]">
                    Email address cannot be changed.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                    New Password
                  </label>

                  <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                    <Lock className="h-5 w-5 text-[#9b8d76]" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
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

                {/* Joined */}
                <div className="rounded-3xl border border-yellow-100 bg-[#fff9ef] p-6">
                  <p className="text-sm text-[#7b6f5c]">
                    Synapse Member Since
                  </p>

                  <p className="mt-2 text-lg font-semibold text-[#2b2418]">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                {status && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm ${
                      status.includes('success')
                        ? 'border border-green-200 bg-green-50 text-green-700'
                        : status.includes('Unable') ||
                          status.includes('wrong')
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-yellow-200 bg-yellow-50 text-amber-700'
                    }`}
                  >
                    {status.includes('success') ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-5 w-5" />
                    )}

                    <span>{status}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-6 py-4 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.01] hover:from-[#fff0ba] hover:to-[#ffe08d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving
                    ? 'Saving Changes...'
                    : 'Save Profile Changes'}
                </button>
              </form>
            ) : (
              <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load profile information.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}