export type PresentationItem = {
  id?: string;
  line: string;
  text: string;
  category: string;
  confidence: 'high' | 'medium' | 'low' | string;
  relevance_percent: number;
  importance: number;
  pinned?: boolean;
  created_at?: string;
  tags?: string[];
};

export type RetrievalPresentation = {
  title: string;
  items: PresentationItem[];
  count: number;
  empty_message: string;
};

export type RetrievalResponse = {
  query: string;
  result_count: number;
  intent?: string;
  relevant_memories?: Record<string, unknown[]>;
  context_summary?: {
    total_sections?: number;
    memory_count?: number;
  };
  compressed_context?: {
    text?: string;
    sections?: Array<{
      section: string;
      count: number;
      summary: string;
      highlights: string[];
    }>;
  };
  results?: Array<{
    id: string;
    text: string;
    category: string;
    relevance?: number;
    confidence?: string;
    importance?: number;
    pinned?: boolean;
    created_at?: string;
    tags?: string[];
    temporal_match?: boolean;
  }>;
  presentation?: RetrievalPresentation;
};

export function getPresentation(
  data: RetrievalResponse
): RetrievalPresentation {
  if (data.presentation?.items?.length) {
    return data.presentation;
  }

  const items: PresentationItem[] = (data.results || []).map(
    (memory) => ({
      id: memory.id,
      line: memory.text.startsWith('✓')
        ? memory.text
        : `✓ ${memory.text}`,
      text: memory.text,
      category: memory.category,
      confidence: memory.confidence || 'medium',
      relevance_percent: Math.round((memory.relevance || 0) * 100),
      importance: memory.importance || 0.5,
      pinned: memory.pinned,
      created_at: memory.created_at,
      tags: memory.tags,
    })
  );

  return {
    title: 'Relevant Memories',
    items,
    count: items.length,
    empty_message:
      'No relevant memories matched this query. Store more context about your goals, projects, or preferences.',
  };
}

export function confidenceBadgeClass(
  confidence: string
): string {
  if (confidence === 'high') {
    return 'border-green-200 bg-green-50 text-green-700';
  }
  if (confidence === 'medium') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
}
