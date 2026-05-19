/**
 * Synapse AI Service API Client
 * Utilities for communicating with the Synapse AI backend
 */

const API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

interface APIErrorResponse {
  error: string;
  detail?: string;
}

interface MemoryItem {
  id: string;
  text: string;
  importance: number;
  category: string;
  tags: string[];
  created_at: string;
  metadata?: Record<string, any>;
}

interface QueryResult {
  memory_id: string;
  text: string;
  relevance: number;
  category: string;
  importance?: number;
}

interface AIQueryResponse {
  query: string;
  results: QueryResult[];
  context_summary: string;
  total_results: number;
}

interface UserProfile {
  user_id: string;
  personality_traits: Record<string, any>;
  preferences: Record<string, any>;
  memory_count: number;
  last_updated: string;
}

/**
 * Get JWT token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('synapse_token');
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const chars = [...binary].map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`);
  return decodeURIComponent(chars.join(''));
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeJwtPayload(token);
  if (!decoded || typeof decoded !== 'object') return null;

  return typeof decoded.userId === 'string' ? decoded.userId : null;
}

function buildHeaders({ auth = false, json = false }: { auth?: boolean; json?: boolean } = {}) {
  const headers: Record<string, string> = {};
  const token = getToken();

  if (auth) {
    if (!token) throw new Error('Not authenticated');
    headers.Authorization = `Bearer ${token}`;
    const userId = getUserIdFromToken();
    if (userId) {
      headers['X-User-ID'] = userId;
    }
  }

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: APIErrorResponse = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Create a new memory
 */
export async function createMemory(
  text: string,
  importance: number = 0.5,
  category: string = 'general',
  tags: string[] = [],
  metadata: Record<string, any> = {}
): Promise<MemoryItem> {
  const response = await fetch(`${API_URL}/memory/`, {
    method: 'POST',
    headers: buildHeaders({ auth: true, json: true }),
    body: JSON.stringify({
      text,
      importance,
      category,
      tags,
      metadata,
    }),
  });

  return handleResponse<MemoryItem>(response);
}

/**
 * Get all memories with optional pagination and filters
 */
export async function getMemories(
  skip: number = 0,
  limit: number = 10,
  category?: string,
  tags?: string[]
): Promise<{ memories: MemoryItem[]; total: number }> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (category) params.append('category', category);
  if (tags && tags.length > 0) params.append('tags', tags.join(','));

  const response = await fetch(`${API_URL}/memory/?${params}`, {
    headers: buildHeaders({ auth: true }),
  });

  return handleResponse<{ memories: MemoryItem[]; total: number }>(response);
}

/**
 * Get a specific memory by ID
 */
export async function getMemory(id: string): Promise<MemoryItem> {
  const response = await fetch(`${API_URL}/memory/${id}`, {
    headers: buildHeaders({ auth: true }),
  });

  return handleResponse<MemoryItem>(response);
}

/**
 * Update a memory
 */
export async function updateMemory(
  id: string,
  updates: Partial<MemoryItem>
): Promise<MemoryItem> {
  const response = await fetch(`${API_URL}/memory/${id}`, {
    method: 'PUT',
    headers: buildHeaders({ auth: true, json: true }),
    body: JSON.stringify(updates),
  });

  return handleResponse<MemoryItem>(response);
}

/**
 * Delete a memory
 */
export async function deleteMemory(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/memory/${id}`, {
    method: 'DELETE',
    headers: buildHeaders({ auth: true }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete memory');
  }
}

/**
 * Query memories with semantic search and context retrieval
 */
export async function queryMemories(
  query: string,
  topK: number = 5,
  userId?: string
): Promise<AIQueryResponse> {
  const response = await fetch(`${API_URL}/ai/query`, {
    method: 'POST',
    headers: buildHeaders({ auth: true, json: true }),
    body: JSON.stringify({
      query,
      top_k: topK,
      user_id: userId,
    }),
  });

  return handleResponse<AIQueryResponse>(response);
}

/**
 * Get user personality profile and preferences
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/ai/profile/${userId}`, {
    headers: buildHeaders({ auth: true }),
  });

  return handleResponse<UserProfile>(response);
}

/**
 * Get text embedding
 */
export async function getEmbedding(text: string): Promise<{
  text: string;
  embedding: number[];
  dimension: number;
  model: string;
}> {
  const response = await fetch(`${API_URL}/embedding/embed`, {
    method: 'POST',
    headers: buildHeaders({ auth: true, json: true }),
    body: JSON.stringify({ text }),
  });

  return handleResponse<{
    text: string;
    embedding: number[];
    dimension: number;
    model: string;
  }>(response);
}

/**
 * Get AI service health status
 */
export async function getHealthStatus(): Promise<{ status: string; message?: string }> {
  const response = await fetch(`${API_URL}/health`, {
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<{ status: string; message?: string }>(response);
}

/**
 * Search memories
 */
export async function searchMemories(
  query: string,
  limit: number = 10
): Promise<MemoryItem[]> {
  const response = await fetch(`${API_URL}/retrieval/search`, {
    method: 'POST',
    headers: buildHeaders({ auth: true, json: true }),
    body: JSON.stringify({
      query,
      limit,
    }),
  });

  const data = await handleResponse<{ results: MemoryItem[] }>(response);
  return data.results;
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<{
  total_memories: number;
  categories: Record<string, number>;
  average_importance: number;
  memory_by_date: Record<string, number>;
}> {
  const response = await fetch(`${API_URL}/ai/stats`, {
    headers: buildHeaders({ auth: true }),
  });

  return handleResponse<{
    total_memories: number;
    categories: Record<string, number>;
    average_importance: number;
    memory_by_date: Record<string, number>;
  }>(response);
}

/**
 * Compress old memories
 */
export async function compressMemories(): Promise<{
  compressed_count: number;
  total_savings: number;
  message: string;
}> {
  const response = await fetch(`${API_URL}/ai/compress`, {
    method: 'POST',
    headers: buildHeaders({ auth: true, json: true }),
  });

  return handleResponse<{
    compressed_count: number;
    total_savings: number;
    message: string;
  }>(response);
}

export type LLMProvider = 'local' | 'openai' | 'claude' | 'ollama' | 'huggingface';

export interface ChatPayload {
  provider: LLMProvider;
  prompt: string;
  top_k?: number;
  use_memory?: boolean;
  model?: string;
}

export interface ChatResponse {
  provider: string;
  model: string;
  prompt: string;
  use_memory?: boolean;
  memory_context?: string;
  response?: string;
  result?: any;
  raw?: any;
}

export async function chatWithProvider(payload: ChatPayload): Promise<ChatResponse> {
  const response = await fetch('/api/ai/llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  return handleResponse<ChatResponse>(response);
}
