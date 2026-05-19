'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Brain,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.localStorage.setItem('synapse_token', data.token);
        window.location.href = '/dashboard';
      } else {
        setMessage(data.error || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff7e8] px-6 py-10">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_25px_90px_rgba(255,210,90,0.18)] backdrop-blur-2xl lg:grid-cols-[1fr_0.95fr]">
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
              Cognitive AI Infrastructure
            </div>

            <h2 className="mt-8 text-5xl font-bold leading-tight tracking-tight text-[#2b2418]">
              Persistent Memory For Modern AI
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-8 text-[#5f5545]">
              Connect users, memories, and multiple AI models through a unified
              semantic intelligence layer.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="relative mt-14 space-y-5">
            {[
              {
                icon: Brain,
                title: 'Semantic Memory',
                desc: 'Persistent context across AI systems.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure Identity',
                desc: 'JWT-powered authentication & protection.',
              },
              {
                icon: Sparkles,
                title: 'Cross-Model Intelligence',
                desc: 'Shared continuity between GPT, Claude, Gemini, Ollama, and Hugging Face.',
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
              <Lock className="h-4 w-4" />
              Secure Login
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#2b2418]">
              Welcome back
            </h2>

            <p className="mt-4 max-w-md text-lg leading-8 text-[#5f5545]">
              Continue your cognitive AI journey with Synapse Intelligence.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            {/* Email */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#4d4333]">
                Email Address
              </label>

              <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                <Mail className="h-5 w-5 text-[#9b8d76]" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#4d4333]">
                  Password
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-amber-700 transition hover:text-amber-900"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="group flex items-center rounded-2xl border border-yellow-200/70 bg-white/80 px-4 transition-all duration-300 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-yellow-100">
                <Lock className="h-5 w-5 text-[#9b8d76]" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent px-4 py-4 text-[#2b2418] outline-none placeholder:text-[#9b8d76]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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

            {/* Error */}
            {message ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {message}
              </div>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-6 py-4 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.01] hover:from-[#fff0ba] hover:to-[#ffe08d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in to Synapse'}

              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 border-t border-yellow-200/50 pt-8 text-center">
            <p className="text-[#6f624f]">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-amber-700 transition hover:text-amber-900"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}