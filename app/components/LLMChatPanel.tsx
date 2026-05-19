'use client';

import { useState } from 'react';
import { chatWithProvider } from '@/lib/synapse-ai-client';

const providers = [
  { value: 'local', label: 'Local Synapse Memory' },
  { value: 'openai', label: 'OpenAI ChatGPT' },
  { value: 'claude', label: 'Anthropic Claude' },
  { value: 'ollama', label: 'Ollama (local/self-hosted)' },
  { value: 'huggingface', label: 'Hugging Face / custom model' },
];

export default function LLMChatPanel({ userName }: { userName: string }) {
  const [provider, setProvider] = useState<'local' | 'openai' | 'claude' | 'ollama' | 'huggingface'>('local');
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [useMemory, setUseMemory] = useState(true);
  const [topK, setTopK] = useState(5);
  const [response, setResponse] = useState<string>('');
  const [memoryContext, setMemoryContext] = useState<string>('');
  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getDefaultModel() {
    if (provider === 'openai') return 'gpt-4o-mini';
    if (provider === 'claude') return 'claude-3.5-mini';
    if (provider === 'ollama') return 'llama2';
    if (provider === 'huggingface') return 'gpt2';
    return '';
  }

  async function handleSubmit() {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setError(null);
    setLoading(true);
    setResponse('');
    setMemoryContext('');
    setRaw(null);

    try {
      const result = await chatWithProvider({
        provider,
        prompt: prompt.trim(),
        model: model.trim() || getDefaultModel(),
        use_memory: useMemory,
        top_k: topK,
      });

      if (result.provider === 'local') {
        setMemoryContext(JSON.stringify(result.result, null, 2));
        setResponse('Local memory results returned. See memory context output.');
      } else {
        setResponse(result.response || 'No response from provider.');
        setMemoryContext(result.memory_context || '');
      }
      setRaw(result.raw ?? result);
    } catch (err: any) {
      setError(err.message || 'Chat request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2.4rem] border border-slate-800/70 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">Chat with local or direct LLMs</h2>
          <p className="mt-2 text-slate-400">
            Ask questions and choose the backend: local Synapse memory, OpenAI ChatGPT, Anthropic Claude, Ollama, Hugging Face, or your own custom model.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/80 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Provider
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value as 'local' | 'openai' | 'claude' | 'ollama' | 'huggingface')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                {providers.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {provider !== 'local' && (
              <label className="space-y-2 text-sm text-slate-300">
                Model
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder={getDefaultModel()}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
            )}
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Prompt
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={6}
              placeholder="Ask a question, summarize memory, or request follow-up context."
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none focus:border-cyan-400"
            />
          </label>

          {provider !== 'local' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Include memory context
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useMemory}
                    onChange={(event) => setUseMemory(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <span className="text-slate-400">Attach local memory results to the prompt</span>
                </div>
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                Memory top K
                <input
                  type="number"
                  value={topK}
                  min={1}
                  max={10}
                  onChange={(event) => setTopK(parseInt(event.target.value, 10) || 1)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Chat Request'}
          </button>

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-6">
            <h3 className="text-lg font-semibold text-white">Response</h3>
            <div className="mt-4 whitespace-pre-wrap rounded-3xl border border-slate-800/60 bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">
              {response || 'Responses from the selected provider will appear here.'}
            </div>
          </div>

          {memoryContext && (
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-6">
              <h3 className="text-lg font-semibold text-white">Memory Context</h3>
              <pre className="mt-4 whitespace-pre-wrap rounded-3xl border border-slate-800/60 bg-slate-950/80 p-4 text-sm leading-6 text-slate-200">
                {memoryContext}
              </pre>
            </div>
          )}

          {raw && (
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-6">
              <h3 className="text-lg font-semibold text-white">Raw Response</h3>
              <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-3xl border border-slate-800/60 bg-slate-950/80 p-4 text-xs leading-5 text-slate-300">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
