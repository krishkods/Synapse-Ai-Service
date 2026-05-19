'use client';

import { useState, useEffect } from 'react';
import {
  createMemory,
  getMemories,
  queryMemories,
  getMemoryStats,
  deleteMemory,
  getHealthStatus,
} from '@/lib/synapse-ai-client';

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
    <div className="space-y-8 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-white">🧠 Memory & AI Integration</h2>
        <p className="text-slate-400">Create and manage semantic memories, then query them with AI-powered search.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800">
        {['query', 'memories', 'stats'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-semibold transition capitalize ${
              activeTab === tab
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'query' && '🔍 Query'}
            {tab === 'memories' && '🧠 Memories'}
            {tab === 'stats' && '📊 Stats'}
          </button>
        ))}
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-red-200">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-950/30 p-4 text-green-200">
          ✅ {success}
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Semantic Memory Search</h3>
            <div className="space-y-4">
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Ask a question or search for information..."
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              />
              <button
                onClick={handleQuery}
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 text-slate-950 px-6 py-2 rounded-lg font-semibold transition"
              >
                {loading ? 'Searching...' : 'Search Memory'}
              </button>
            </div>
          </div>

          {querySummary && (
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
              <h4 className="font-semibold text-white mb-2">Context Summary</h4>
              <p className="text-slate-300">{querySummary}</p>
            </div>
          )}

          {queryResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Search Results ({queryResults.length})</h4>
              {queryResults.map((result) => (
                <div
                  key={result.memory_id}
                  className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-slate-200">{result.text}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded">
                          {result.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          Relevance: {(result.relevance * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Memories Tab */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          {/* Create Memory Form */}
          <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Memory</h3>
            <div className="space-y-4">
              <textarea
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="What do you want to remember?"
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">Category</label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="general">General</option>
                    <option value="preferences">Preferences</option>
                    <option value="conversation">Conversation</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 block mb-2">
                    Importance: {newMemoryImportance.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newMemoryImportance}
                    onChange={(e) => setNewMemoryImportance(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <input
                type="text"
                value={newMemoryTags}
                onChange={(e) => setNewMemoryTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100"
              />
              <button
                onClick={handleCreateMemory}
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 text-slate-950 px-6 py-2 rounded-lg font-semibold transition w-full"
              >
                {loading ? 'Creating...' : 'Create Memory'}
              </button>
            </div>
          </div>

          {/* Memories List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Memories ({memories.length})</h3>
            {loading && activeTab === 'memories' ? (
              <p className="text-slate-400">Loading memories...</p>
            ) : memories.length === 0 ? (
              <p className="text-slate-400">No memories yet. Create one above!</p>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-slate-200">{memory.text}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded">
                            {memory.category}
                          </span>
                          <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                            Importance: {memory.importance.toFixed(1)}
                          </span>
                          {memory.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 disabled:text-slate-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
              <p className="text-sm text-slate-400">Service Status</p>
              <p className="text-2xl font-bold mt-2">
                {serviceHealth === null ? '...' : serviceHealth ? '✅ Online' : '❌ Offline'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
              <p className="text-sm text-slate-400">Total Memories</p>
              <p className="text-2xl font-bold mt-2">{stats?.total_memories ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
              <p className="text-sm text-slate-400">Avg Importance</p>
              <p className="text-2xl font-bold mt-2">
                {stats?.average_importance ? stats.average_importance.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          {stats?.categories && (
            <div className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-6">
              <h3 className="font-semibold text-white mb-4">Memory Categories</h3>
              <div className="space-y-2">
                {Object.entries(stats.categories).map(([category, count]: [string, any]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-slate-300">{category}</span>
                    <span className="text-cyan-300 font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
