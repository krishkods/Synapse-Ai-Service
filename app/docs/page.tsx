'use client';

import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Database,
  Brain,
  Rocket,
  ArrowRight,
  Server,
  Terminal,
  Lock,
  Cpu,
  LayoutDashboard,
  Boxes,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';

const quickLinks = [
  {
    href: '#getting-started',
    title: 'Getting Started',
    icon: Rocket,
  },
  {
    href: '#authentication',
    title: 'Authentication',
    icon: ShieldCheck,
  },
  {
    href: '#memory-api',
    title: 'Memory API',
    icon: Database,
  },
  {
    href: '#ai-queries',
    title: 'AI Queries',
    icon: Brain,
  },
  {
    href: '#chat-api',
    title: 'LLM Chat',
    icon: Bot,
  },
  {
    href: '#dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '#deployment',
    title: 'Deployment',
    icon: Server,
  },
];

function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_50px_rgba(255,220,120,0.10)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white">
      {children}
    </div>
  );
}

function CodeBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-yellow-200/60 bg-[#fff9ef] shadow-inner">
      <div className="flex items-center gap-2 border-b border-yellow-100 px-5 py-3">
        <div className="h-3 w-3 rounded-full bg-red-300" />
        <div className="h-3 w-3 rounded-full bg-yellow-300" />
        <div className="h-3 w-3 rounded-full bg-green-300" />
      </div>

      <pre className="overflow-x-auto p-6 text-sm leading-7 text-[#3b3210]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-4xl font-bold tracking-tight text-[#2b2418]">
        {title}
      </h2>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5545]">
        {description}
      </p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7e8] px-6 py-10 sm:px-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-100px] top-[-100px] h-[450px] w-[450px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[380px] w-[380px] rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* HERO */}
        <header className="overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-white/80 shadow-[0_20px_80px_rgba(255,210,90,0.18)] backdrop-blur-2xl">
          <div className="grid gap-14 p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-100/70 px-4 py-2 text-sm font-semibold tracking-wide text-amber-800">
                <BookOpen className="h-4 w-4" />
                Synapse Documentation
              </div>

              <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#2b2418] sm:text-7xl">
                Build AI Systems With Persistent Intelligence
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#5f5545] sm:text-xl">
                Complete integration guide for Synapse semantic memory,
                authentication, AI context retrieval, deployment, and cognitive
                infrastructure APIs.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-3 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-white/70 px-8 py-3 text-sm font-semibold text-[#5a4b33] transition-all duration-300 hover:bg-yellow-50"
                >
                  Open API Docs
                </a>
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-[2rem] border border-yellow-200/40 bg-gradient-to-br from-[#fffef8] to-[#fff5dd] p-8 shadow-inner">
              <div className="flex h-full flex-col justify-center gap-6">
                {[
                  {
                    icon: Brain,
                    title: 'Semantic Memory',
                    desc: 'Persistent memory infrastructure for AI systems.',
                  },
                  {
                    icon: Cpu,
                    title: 'AI Context Engine',
                    desc: 'Intelligent context retrieval and orchestration.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Secure Authentication',
                    desc: 'JWT-based identity and session management.',
                  },
                  {
                    icon: Boxes,
                    title: 'Cross-Model Continuity',
                    desc: 'Unified memory layer for multiple LLMs.',
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
          </div>
        </header>

        {/* QUICK LINKS */}
        <section className="py-24">
          <SectionHeading
            title="Documentation Sections"
            description="Navigate through Synapse architecture, APIs, authentication, deployment, and integration guides."
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="group rounded-[2rem] border border-yellow-200/40 bg-white/80 p-7 shadow-[0_10px_40px_rgba(255,220,120,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff4c7] to-[#ffe9a6] shadow-md">
                    <Icon className="h-8 w-8 text-amber-800" />
                  </div>

                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    {item.title}
                  </h3>

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-amber-700">
                    Explore Section
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* GETTING STARTED */}
        <section id="getting-started" className="mb-24 scroll-mt-24">
          <SectionHeading
            title="Getting Started"
            description="Initialize Synapse locally and connect your AI systems."
          />

          <div className="grid gap-6">
            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <CheckCircle2 className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Prerequisites
                  </h3>

                  <p className="text-[#5f5545]">
                    Required tools before installation.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  'Synapse AI Service running',
                  'Node.js 18+ installed',
                  'MongoDB database available',
                  'npm or yarn installed',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-yellow-100 bg-yellow-50/60 p-5 text-[#5f5545]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <Terminal className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Installation
                  </h3>

                  <p className="text-[#5f5545]">
                    Install dependencies and initialize the project.
                  </p>
                </div>
              </div>

              <CodeBlock>
                {`cd synapse-web

npm install

npm run dev`}
              </CodeBlock>
            </SectionCard>
          </div>
        </section>

        {/* AUTH */}
        <section id="authentication" className="mb-24 scroll-mt-24">
          <SectionHeading
            title="Authentication"
            description="JWT-based authentication and identity management."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <Lock className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Register
                  </h3>

                  <p className="text-[#5f5545]">
                    Create a Synapse account.
                  </p>
                </div>
              </div>

              <CodeBlock>
                {`POST /api/auth/register

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}`}
              </CodeBlock>
            </SectionCard>

            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <ShieldCheck className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Login
                  </h3>

                  <p className="text-[#5f5545]">
                    Authenticate users securely.
                  </p>
                </div>
              </div>

              <CodeBlock>
                {`POST /api/auth/login

{
  "email": "john@example.com",
  "password": "securePassword123"
}`}
              </CodeBlock>
            </SectionCard>
          </div>
        </section>

        {/* MEMORY API */}
        <section id="memory-api" className="mb-24 scroll-mt-24">
          <SectionHeading
            title="Memory API"
            description="Create, retrieve, and manage semantic memories."
          />

          <div className="space-y-6">
            <SectionCard>
              <h3 className="mb-6 text-2xl font-semibold text-[#2b2418]">
                Create Memories
              </h3>

              <CodeBlock>
                {`const response = await fetch(
  'http://localhost:8000/memory/',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'User preference: React over Vue',
      importance: 0.8
    })
  }
);`}
              </CodeBlock>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-6 text-2xl font-semibold text-[#2b2418]">
                Retrieve Memories
              </h3>

              <CodeBlock>
                {`const response = await fetch(
  'http://localhost:8000/memory/?skip=0&limit=10'
);

const memories = await response.json();`}
              </CodeBlock>
            </SectionCard>
          </div>
        </section>

        {/* CHAT & LLM API */}
        <section id="chat-api" className="mb-24 scroll-mt-24">
          <SectionHeading
            title="Direct LLM Chat"
            description="Choose local Synapse memory retrieval or connect directly to OpenAI, Claude, Ollama, Hugging Face, or your own custom model."
          />

          <div className="space-y-6">
            <SectionCard>
              <h3 className="mb-6 text-2xl font-semibold text-[#2b2418]">
                Chat Interface
              </h3>
              <p className="text-[#5f5545]">
                Visit <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-900">/chat</code> to use the new chat experience.
              </p>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-6 text-2xl font-semibold text-[#2b2418]">
                Direct LLM API
              </h3>
              <CodeBlock>
                {`POST /api/ai/llm

{
  "provider": "openai", // local | openai | claude | ollama | huggingface
  "prompt": "Summarize my current project goals.",
  "use_memory": true,
  "top_k": 5,
  "model": "gpt-4o-mini"
}`}
              </CodeBlock>
              <p className="text-[#5f5545]">
                /api/ai/llm forwards requests either to the local Synapse service or directly to OpenAI, Claude, Ollama, or Hugging Face depending on the selected provider.
              </p>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-6 text-2xl font-semibold text-[#2b2418]">
                External Provider Setup
              </h3>
              <CodeBlock>
                {`# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_API_BASE=https://api.openai.com/v1

# Anthropic Claude
ANTHROPIC_API_KEY=your-anthropic-key
ANTHROPIC_API_BASE=https://api.anthropic.com/v1

# Ollama
OLLAMA_API_BASE=http://localhost:11434
OLLAMA_API_KEY=optional-key-if-configured

# Hugging Face
HUGGINGFACE_API_KEY=your-hf-key
HUGGINGFACE_API_BASE=https://api-inference.huggingface.co/models`}
              </CodeBlock>
              <p className="text-[#5f5545]">
                Use provider-specific API keys and endpoints to connect third-party and self-hosted models through the same Synapse chat interface.
              </p>
            </SectionCard>
          </div>
        </section>

        {/* DEPLOYMENT */}
        <section id="deployment" className="mb-24 scroll-mt-24">
          <SectionHeading
            title="Deployment"
            description="Deploy Synapse into production environments."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <Rocket className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Production Build
                  </h3>

                  <p className="text-[#5f5545]">
                    Build optimized production assets.
                  </p>
                </div>
              </div>

              <CodeBlock>
                {`npm run build

npm start`}
              </CodeBlock>
            </SectionCard>

            <SectionCard>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                  <Server className="h-7 w-7 text-amber-700" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#2b2418]">
                    Docker Deployment
                  </h3>

                  <p className="text-[#5f5545]">
                    Containerize Synapse easily.
                  </p>
                </div>
              </div>

              <CodeBlock>
                {`FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm run build

CMD ["npm", "start"]`}
              </CodeBlock>
            </SectionCard>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mb-20 overflow-hidden rounded-[2.8rem] border border-yellow-200/50 bg-gradient-to-br from-[#fff7df] to-[#fff1c8] shadow-[0_20px_80px_rgba(255,210,90,0.16)]">
          <div className="grid items-center gap-10 p-10 lg:grid-cols-[1fr_auto] lg:p-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white/60 px-4 py-2 text-sm font-semibold text-amber-800">
                <Sparkles className="h-4 w-4" />
                Synapse Intelligence
              </div>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#2b2418] sm:text-5xl">
                Build AI Systems That Remember
              </h2>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5f5545]">
                Connect users, memories, and AI models through a universal
                semantic intelligence layer.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-8 py-4 text-sm font-semibold text-[#3b3210] shadow-lg shadow-yellow-200/60 transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-yellow-200 bg-white/70 px-8 py-4 text-sm font-semibold text-[#5a4b33] transition-all duration-300 hover:bg-white"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}