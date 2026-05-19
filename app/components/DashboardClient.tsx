'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
import MemoryManagementPanel from './MemoryManagementPanel';
import {
  createMemory,
  getMemories,
  queryMemories,
  getMemoryStats,
  deleteMemory,
  getHealthStatus,
} from '@/lib/synapse-ai-client';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

interface Memory {
  id: string;
  text: string;
  importance: number;
  category: string;
  tags: string[];
  created_at: string;
}

interface QueryResult {
  memory_id: string;
  text: string;
  relevance: number;
  category: string;
}

export default function DashboardClient({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const user: UserProfile | null = userId ? { id: userId, name: userName, email: '', createdAt: new Date().toISOString() } : null;
  const [activeTab, setActiveTab] = useState<'query' | 'memories' | 'stats'>('query');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Query state
  const [queryText, setQueryText] = useState('');
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [querySummary, setQuerySummary] = useState('');

  // Memory state
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryImportance, setNewMemoryImportance] = useState(0.5);
  const [newMemoryCategory, setNewMemoryCategory] = useState('general');
  const [newMemoryTags, setNewMemoryTags] = useState('');

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null);

  // Fetch memories on load
  useEffect(() => {
    if (activeTab === 'memories') {
      fetchMemories();
    }
  }, [activeTab]);

  // Fetch stats on load
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
      checkServiceHealth();
    }
  }, [activeTab]);

  async function fetchMemories() {
    setLoading(true);
    setError(null);
    try {
      const response = await getMemories(0, 20);
      setMemories(response.memories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const statsData = await getMemoryStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkServiceHealth() {
    try {
      await getHealthStatus();
      setServiceHealth(true);
    } catch {
      setServiceHealth(false);
    }
  }

  async function handleQuery() {
    if (!queryText.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await queryMemories(queryText, 5, userId);
      setQueryResults(response.results);
      setQuerySummary(response.context_summary);
      setSuccess('Query completed successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMemory() {
    if (!newMemoryText.trim()) {
      setError('Please enter memory text');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tags = newMemoryTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
      
      await createMemory(
        newMemoryText,
        newMemoryImportance,
        newMemoryCategory,
        tags
      );

      setSuccess('Memory created successfully');
      setNewMemoryText('');
      setNewMemoryTags('');
      setNewMemoryImportance(0.5);
      setNewMemoryCategory('general');
      
      // Refresh memories list
      await fetchMemories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMemory(id: string) {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    setLoading(true);
    setError(null);
    try {
      await deleteMemory(id);
      setSuccess('Memory deleted successfully');
      await fetchMemories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
              <p className="text-slate-400">Manage your Synapse session and query the AI service directly.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/docs" className="rounded-full border border-slate-700/80 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300/70">
                Integration docs
              </Link>
              <SignOutButton />
            </div>
          </div>

          {user ? (
            <div className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6">
              <div className="flex flex-col gap-1 text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Signed in as</p>
                  <p className="mt-2 text-xl font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <p className="text-sm text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700/70 bg-slate-950/60 p-6 text-slate-300">
              <p className="text-lg">You’re not signed in yet.</p>
              <p className="mt-3">Please <Link href="/login" className="text-cyan-300 underline">login</Link> or <Link href="/register" className="text-cyan-300 underline">register</Link> first.</p>
            </div>
          )}
        </div>

        {user ? (
          <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
            <h2 className="text-2xl font-semibold text-white">Run a Synapse AI query</h2>
            <p className="mt-3 text-slate-400">Send a prompt to the AI service through the web portal.</p>
            <form onSubmit={handleQuery} className="mt-6 grid gap-4">
              <textarea
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                rows={4}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-4 text-slate-100 outline-none transition focus:border-cyan-400"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Send query
              </button>
            </form>

            {success ? <p className="mt-4 text-sm text-slate-300">{success}</p> : null}

            {querySummary && (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl bg-slate-950/80 p-6">
                  <h3 className="text-lg font-semibold text-white">Context Summary</h3>
                  <p className="mt-2 text-slate-300">{querySummary}</p>
                </div>
                <div className="grid gap-4">
                  {queryResults.map((item, index) => (
                    <article key={index} className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6">
                      <p className="text-slate-300">{item.text}</p>
                      <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                        <span>Relevance: {(item.relevance * 100).toFixed(0)}%</span>
                        <span>Category: {item.category}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}

        {user ? <MemoryManagementPanel userId={user.id} /> : null}
      </div>
    </main>
  );
}
