/**
 * Synapse Cognitive Engine Client
 * Frontend API utilities for Synapse memory infrastructure
 */

const API_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  'http://localhost:8000';

const SYNAPSE_NAMESPACE =
  process.env.NEXT_PUBLIC_SYNAPSE_NAMESPACE ||
  'synapse-web';

// =====================================================
// Types
// =====================================================

export type MemoryCategory =
  | 'identity'
  | 'preference'
  | 'goal'
  | 'project'
  | 'skill'
  | 'relationship'
  | 'temporary'
  | 'conversation';

export type MemoryMode =
  | 'off'
  | 'smart'
  | 'full';

export interface MemoryItem {
  id: string;
  namespace?: string;
  text: string;
  importance: number;
  category: MemoryCategory;
  tags: string[];
  created_at: string;
  updated_at?: string;
  relevance?: number;
  metadata?: Record<string, unknown>;
  pinned?: boolean;
  archived?: boolean;
  expires_at?: string | null;
  expired?: boolean;
  access_count?: number;
}

export interface RetrievalResult {
  id: string;
  namespace?: string;
  text: string;
  category: MemoryCategory;
  relevance: number;
  importance: number;
  score?: number;
  rerank_score?: number;
  tags?: string[];
  pinned?: boolean;
  created_at?: string;
  keyword_score?: number;
  freshness_score?: number;
  temporal_match?: boolean;
}

export interface RetrievalPresentation {
  title: string;
  items: Array<{
    id?: string;
    line: string;
    text: string;
    category: string;
    confidence: string;
    relevance_percent: number;
    importance: number;
    pinned?: boolean;
    created_at?: string;
    tags?: string[];
  }>;
  count: number;
  empty_message: string;
}

export interface RetrievalResponse {
  query: string;
  result_count: number;
  intent?: string;
  relevant_memories: Record<
    string,
    RetrievalResult[]
  >;
  context_summary: {
    total_sections: number;
    memory_count: number;
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
  results: RetrievalResult[];
  presentation?: RetrievalPresentation;
  relationships?: Array<{
    memory_id: string;
    related_memory_ids: string[];
  }>;
  applied_filters?: {
    category?: string | null;
    tags?: string[];
    include_archived?: boolean;
    temporal_range?: {
      label?: string;
      start?: string;
      end?: string;
    } | null;
  };
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  category?: string | null;
  tags: string[];
  topK: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  started_at?: string;

  cognition_stack?: {
    embedding_model?: {
      loaded: boolean;
      model: string;
      vector_size: number;
    };

    reranker_model?: {
      loaded: boolean;
      model: string;
    };
  };

  infrastructure?: {
    qdrant?: {
      connected: boolean;
      collection?: string;
    };

    redis?: {
      connected: boolean;
    };
  };
}

export interface ModelResponse {
  status: string;

  models: {
    embedding: {
      name: string;
      loaded: boolean;
      vector_size: number;
    };

    reranker: {
      name: string;
      loaded: boolean;
    };
  };
}

// =====================================================
// Token Helpers
// =====================================================

function getToken():
  | string
  | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null;
  }

  return localStorage.getItem(
    'synapse_token'
  );
}

function base64UrlDecode(
  input: string
): string {
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = base64.padEnd(
    base64.length +
      ((4 -
        (base64.length % 4)) %
        4),
    '='
  );

  const binary = atob(
    padded
  );

  const chars = [...binary].map(
    (char) =>
      `%${char.charCodeAt(0)
        .toString(16)
        .padStart(2, '0')}`
  );

  return decodeURIComponent(
    chars.join('')
  );
}

function decodeJwtPayload(
  token: string
):
  | Record<
      string,
      unknown
    >
  | null {
  try {
    const parts =
      token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    return JSON.parse(
      base64UrlDecode(
        parts[1]
      )
    );
  } catch {
    return null;
  }
}

export function getUserId():
  | string
  | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload =
    decodeJwtPayload(token);

  if (
    !payload ||
    typeof payload !==
      'object'
  ) {
    return null;
  }

  return typeof payload.userId ===
    'string'
    ? payload.userId
    : null;
}

// =====================================================
// Headers
// =====================================================

function buildHeaders({
  auth = false,
  json = false,
  namespace = false,
}: {
  auth?: boolean;
  json?: boolean;
  namespace?: boolean;
} = {}) {
  const headers: Record<
    string,
    string
  > = {};

  const token = getToken();

  if (auth) {
    if (!token) {
      throw new Error(
        'Not authenticated'
      );
    }

    headers.Authorization = `Bearer ${token}`;
  }

  if (json) {
    headers[
      'Content-Type'
    ] = 'application/json';
  }

  if (namespace) {
    headers[
      'X-Synapse-Namespace'
    ] = SYNAPSE_NAMESPACE;
  }

  return headers;
}

// =====================================================
// Response Handler
// =====================================================

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.error ||
        'Request failed'
    );
  }

  return data as T;
}

// =====================================================
// Memory APIs
// =====================================================

export async function createMemory(
  payload: {
    text: string;
    importance?: number;
    category?: MemoryCategory;
    tags?: string[];
    metadata?: Record<
      string,
      unknown
    >;
  }
) {
  const response =
    await fetch(
      `${API_URL}/memory/`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            json: true,
            namespace: true,
          }),
        body: JSON.stringify(
          payload
        ),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

export async function getMemories(
  options?: {
    category?: string;
    tags?: string[];
    limit?: number;
    include_archived?: boolean;
    archived_only?: boolean;
  }
) {
  const params =
    new URLSearchParams();

  if (
    options?.category
  ) {
    params.append(
      'category',
      options.category
    );
  }

  if (
    options?.tags?.length
  ) {
    params.append(
      'tags',
      options.tags.join(',')
    );
  }

  if (
    options?.limit
  ) {
    params.append(
      'limit',
      String(
        options.limit
      )
    );
  }

  if (options?.include_archived) {
    params.append('include_archived', 'true');
  }

  if (options?.archived_only) {
    params.append('archived_only', 'true');
  }

  const response =
    await fetch(
      `${API_URL}/memory/?${params}`,
      {
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    memories: MemoryItem[];
    count: number;
  }>(response);
}

export async function updateMemory(
  memoryId: string,
  updates: Partial<MemoryItem>
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}`,
      {
        method: 'PUT',
        headers:
          buildHeaders({
            auth: true,
            json: true,
            namespace: true,
          }),
        body: JSON.stringify(
          updates
        ),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

export async function deleteMemory(
  memoryId: string
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}`,
      {
        method: 'DELETE',
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    deleted: boolean;
  }>(response);
}

export async function pinMemory(
  memoryId: string
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}/pin`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

export async function archiveMemory(
  memoryId: string
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}/archive`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

export async function unarchiveMemory(
  memoryId: string
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}/unarchive`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

export async function unpinMemory(
  memoryId: string
) {
  const response =
    await fetch(
      `${API_URL}/memory/${memoryId}/unpin`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    memory: MemoryItem;
  }>(response);
}

// =====================================================
// Retrieval APIs
// =====================================================

export async function searchMemories(
  query: string,
  topK: number = 10,
  options?: {
    category?: string;
    tags?: string[];
    include_archived?: boolean;
    include_working_memory?: boolean;
  }
) {
  const response =
    await fetch(
      `${API_URL}/retrieval/search`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            json: true,
            namespace: true,
          }),
        body: JSON.stringify(
          {
            query,
            top_k: topK,
            category:
              options?.category,
            tags:
              options?.tags,
            include_archived:
              options?.include_archived ??
              false,
            include_working_memory:
              options?.include_working_memory ??
              true,
          }
        ),
      }
    );

  const result =
    await handleResponse<{
    success: boolean;
    data: RetrievalResponse;
  }>(response);

  return result.data;
}

export async function queryMemories(
  query: string,
  topK: number = 10,
  options?: {
    category?: string;
    tags?: string[];
    include_archived?: boolean;
    include_working_memory?: boolean;
  }
) {
  return searchMemories(
    query,
    topK,
    options
  );
}

// =====================================================
// Extraction APIs
// =====================================================

export async function extractMemory(
  text: string,
  mode: MemoryMode = 'smart'
) {
  const response =
    await fetch(
      `${API_URL}/ai/extract-memory`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            json: true,
            namespace: true,
          }),
        body: JSON.stringify(
          {
            text,
            mode,
          }
        ),
      }
    );

  return handleResponse<{
    mode: MemoryMode;
    stored: MemoryItem[];
    extracted: unknown[];
    count: number;
  }>(response);
}

// =====================================================
// Embedding APIs
// =====================================================

export async function getEmbedding(
  text: string
) {
  const response =
    await fetch(
      `${API_URL}/embed`,
      {
        method: 'POST',
        headers:
          buildHeaders({
            auth: true,
            json: true,
            namespace: true,
          }),
        body: JSON.stringify(
          {
            text,
          }
        ),
      }
    );

  return handleResponse<{
    success: boolean;
    embedding: number[];
    dimension: number;
    model: string;
  }>(response);
}

// =====================================================
// Health APIs
// =====================================================

export async function getHealthStatus() {
  const response =
    await fetch(
      `${API_URL}/health`,
      {
        headers:
          buildHeaders(),
      }
    );

  return handleResponse<HealthResponse>(
    response
  );
}

export async function getModels() {
  const response =
    await fetch(
      `${API_URL}/model`,
      {
        headers:
          buildHeaders(),
      }
    );

  return handleResponse<ModelResponse>(
    response
  );
}

// =====================================================
// Stats APIs
// =====================================================

export async function getMemoryStats() {
  const response =
    await fetch(
      `${API_URL}/ai/stats`,
      {
        headers:
          buildHeaders({
            auth: true,
            namespace: true,
          }),
      }
    );

  return handleResponse<{
    success: boolean;
    total_memories: number;
    episodic_memories: number;
    semantic_memories: number;
    compressed_memories: number;
    working_memories: number;
    categories: Record<
      string,
      number
    >;
    pinned_memories: number;
    average_importance: number;
  }>(response);
}

// =====================================================
// Saved Query APIs
// =====================================================

export async function getSavedQueries() {
  const response = await fetch(
    '/api/auth/saved-queries',
    {
      headers: buildHeaders({
        auth: true,
      }),
      cache: 'no-store',
    }
  );

  return handleResponse<{
    savedQueries: SavedQuery[];
  }>(response);
}

export async function saveQuery(payload: {
  name: string;
  query: string;
  category?: string | null;
  tags?: string[];
  topK?: number;
}) {
  const response = await fetch(
    '/api/auth/saved-queries',
    {
      method: 'POST',
      headers: buildHeaders({
        auth: true,
        json: true,
      }),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<{
    success: boolean;
    savedQuery: SavedQuery;
  }>(response);
}

export async function deleteSavedQuery(id: string) {
  const response = await fetch(
    `/api/auth/saved-queries?id=${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: buildHeaders({
        auth: true,
      }),
    }
  );

  return handleResponse<{
    success: boolean;
    deleted: boolean;
    id: string;
  }>(response);
}
