'use client';

import { Brain, CheckCircle2 } from 'lucide-react';

import {
  confidenceBadgeClass,
  getPresentation,
  type RetrievalResponse,
} from '@/lib/retrieval-display';

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

export default function RelevantMemoriesPanel({
  data,
  latencyMs,
}: {
  data: RetrievalResponse | null;
  latencyMs?: number | null;
}) {
  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-yellow-200 bg-yellow-50/50 p-10 text-center">
        <Brain className="mx-auto h-12 w-12 text-amber-500" />
        <p className="mt-5 text-lg font-semibold text-[#2b2418]">
          No retrieval yet
        </p>
        <p className="mt-2 text-[#7b6f5c]">
          Query your cognitive memory system to retrieve relevant context.
        </p>
      </div>
    );
  }

  const presentation = getPresentation(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-[#2b2418]">
            {presentation.title}
          </h3>
          <p className="mt-1 text-sm text-[#7b6f5c]">
            Clean semantic retrieval — no vector debug output.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {latencyMs != null && (
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs font-medium text-[#5f5545]">
              {latencyMs}ms
            </span>
          )}
          <span className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm font-semibold text-[#2b2418]">
            {presentation.count} matches
          </span>
        </div>
      </div>

      {presentation.items.length === 0 ? (
        <p className="rounded-3xl border border-yellow-100 bg-white/80 p-6 text-[#5f5545]">
          {presentation.empty_message}
        </p>
      ) : (
        <div className="space-y-6">
          {data.compressed_context?.text && (
            <div className="rounded-3xl border border-yellow-100 bg-yellow-50/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                Compressed Context
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-[#5f5545]">
                {data.compressed_context.text}
              </p>
            </div>
          )}

          <ul className="space-y-4">
            {presentation.items.map((item) => (
              <li
                key={item.id || item.line}
                className="rounded-[1.75rem] border border-yellow-100 bg-gradient-to-br from-[#fffdf7] to-[#fff7e8] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-lg leading-8 text-[#2b2418]">
                        {item.line.replace(/^✓\s*/, '')}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                          {item.category}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${confidenceBadgeClass(item.confidence)}`}
                        >
                          {item.confidence} confidence
                        </span>
                        {item.pinned && (
                          <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                            Pinned
                          </span>
                        )}
                        {(data.results || []).find((result) => result.id === item.id)?.temporal_match && (
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            Temporal match
                          </span>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-yellow-200 bg-white px-2 py-1 text-xs text-[#5f5545]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#7b6f5c]">
                    <p>{item.relevance_percent}% match</p>
                    {formatDate(item.created_at) && (
                      <p className="mt-1">{formatDate(item.created_at)}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
