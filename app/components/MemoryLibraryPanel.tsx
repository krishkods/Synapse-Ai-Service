'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Pencil,
  Pin,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  archiveMemory,
  deleteMemory,
  pinMemory,
  unarchiveMemory,
  unpinMemory,
  updateMemory,
  type MemoryItem,
} from '@/lib/synapse-ai-client';

const SECTION_ORDER = [
  'identity',
  'goal',
  'project',
  'preference',
  'skill',
  'relationship',
  'temporary',
  'conversation',
] as const;

function formatCategory(category: string) {
  return category.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

export default function MemoryLibraryPanel({
  memories,
  loading,
  onRefresh,
}: {
  memories: MemoryItem[];
  loading: boolean;
  onRefresh: (showArchived: boolean) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void onRefresh(showArchived);
  }, [showArchived]);

  const filtered = useMemo(() => {
    return memories.filter((memory) => {
      if (categoryFilter !== 'all' && memory.category !== categoryFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const needle = search.toLowerCase();
      return (
        memory.text.toLowerCase().includes(needle) ||
        memory.tags?.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [memories, search, categoryFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, MemoryItem[]> = {};
    for (const memory of filtered) {
      if (!map[memory.category]) map[memory.category] = [];
      map[memory.category].push(memory);
    }
    return map;
  }, [filtered]);

  async function runAction(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      setMessage(success);
      await onRefresh(showArchived);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action failed');
    }
  }

  function startEdit(memory: MemoryItem) {
    setEditingId(memory.id);
    setEditText(memory.text);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-yellow-200/40 bg-white/80 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
            Search memories
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8d76]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by text or tag..."
              className="w-full rounded-2xl border border-yellow-200 bg-[#fffdf7] py-3 pl-11 pr-4 text-[#2b2418] outline-none focus:border-amber-400"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#5f5545]">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full min-w-[180px] rounded-2xl border border-yellow-200 bg-white px-4 py-3 text-[#2b2418]"
          >
            <option value="all">All categories</option>
            {SECTION_ORDER.map((category) => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            showArchived
              ? 'bg-amber-100 text-amber-900'
              : 'border border-yellow-200 bg-white text-[#5f5545]'
          }`}
        >
          {showArchived ? 'Showing archived only' : 'Show archived'}
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          {message}
          <button type="button" onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {SECTION_ORDER.map((category) => {
        const items = grouped[category];
        if (!items?.length) return null;

        return (
          <section
            key={category}
            className="rounded-[2rem] border border-yellow-200/40 bg-white/80 p-8 shadow-[0_10px_60px_rgba(255,220,120,0.10)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2b2418]">
                {formatCategory(category)}
              </h2>
              <span className="rounded-full border border-yellow-100 bg-yellow-50 px-4 py-2 text-sm text-[#5f5545]">
                {items.length} memories
              </span>
            </div>

            <div className="space-y-4">
              {items.map((memory) => (
                <article
                  key={memory.id}
                  className="rounded-3xl border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-5"
                >
                  {editingId === memory.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-yellow-200 bg-white p-4 text-[#2b2418] outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            void runAction(async () => {
                              await updateMemory(memory.id, { text: editText });
                              setEditingId(null);
                            }, 'Memory updated.')
                          }
                          className="rounded-full bg-gradient-to-r from-[#fff4c7] to-[#ffe9a6] px-5 py-2 text-sm font-semibold text-[#3b3210]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-yellow-200 px-5 py-2 text-sm text-[#5f5545]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="leading-7 text-[#2b2418]">{memory.text}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#7b6f5c]">
                        <span>{formatDate(memory.created_at)}</span>
                        <span>Importance {memory.importance.toFixed(2)}</span>
                        {memory.pinned && (
                          <span className="font-semibold text-amber-700">Pinned</span>
                        )}
                        {memory.archived && (
                          <span className="font-semibold text-slate-600">Archived</span>
                        )}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => startEdit(memory)}
                          className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-white px-3 py-2 text-xs font-semibold text-[#5f5545]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            void runAction(
                              () =>
                                memory.pinned
                                  ? unpinMemory(memory.id)
                                  : pinMemory(memory.id),
                              memory.pinned ? 'Unpinned.' : 'Pinned.'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-white px-3 py-2 text-xs font-semibold text-[#5f5545]"
                        >
                          <Pin className="h-3.5 w-3.5" />
                          {memory.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            void runAction(
                              () =>
                                memory.archived
                                  ? unarchiveMemory(memory.id)
                                  : archiveMemory(memory.id),
                              memory.archived ? 'Restored.' : 'Archived.'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-white px-3 py-2 text-xs font-semibold text-[#5f5545]"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          {memory.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            void runAction(
                              () => deleteMemory(memory.id),
                              'Memory deleted.'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="rounded-3xl border border-dashed border-yellow-200 bg-yellow-50/40 p-8 text-center text-[#7b6f5c]">
          No memories match your filters.
        </p>
      )}
    </div>
  );
}
