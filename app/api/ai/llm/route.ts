import { NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

const AI_SERVICE_URL = process.env.SYNAPSE_AI_SERVICE_URL || "http://localhost:8000";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_BASE = process.env.ANTHROPIC_API_BASE || "https://api.anthropic.com/v1";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_API_BASE = process.env.OLLAMA_API_BASE || "http://localhost:11434";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_BASE = process.env.HUGGINGFACE_API_BASE || "https://api-inference.huggingface.co/models";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3.5-mini";
const DEFAULT_OLLAMA_MODEL = "llama2";

async function fetchLocalQuery(query: string, top_k: number, userId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers["X-User-ID"] = userId;
  }

  const response = await fetch(`${AI_SERVICE_URL}/ai/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, top_k, user_id: userId }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Local AI query failed: ${response.status} ${payload}`);
  }

  return response.json();
}

function buildMemoryContext(results: any[]) {
  if (!Array.isArray(results) || results.length === 0) return "";
  return results
    .slice(0, 6)
    .map((entry, index) => `Context ${index + 1}: ${entry.text}`)
    .join("\n\n");
}

async function callOpenAI(model: string, prompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that uses user memory context when available.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
  }

  return data;
}

async function callAnthropic(model: string, prompt: string) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key is not configured");
  }

  const response = await fetch(`${ANTHROPIC_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens_to_sample: 512,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Anthropic request failed: ${response.status}`);
  }

  return data;
}

async function callOllama(model: string, prompt: string) {
  const response = await fetch(`${OLLAMA_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Ollama request failed: ${response.status}`);
  }

  return data;
}

async function callHuggingFace(model: string, prompt: string) {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error("Hugging Face API key is not configured");
  }

  if (!model) {
    throw new Error("A Hugging Face model name is required");
  }

  const response = await fetch(`${HUGGINGFACE_API_BASE}/${encodeURIComponent(model)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      options: {
        wait_for_model: true,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Hugging Face request failed: ${response.status}`);
  }

  let text = "";
  if (typeof data === "string") {
    text = data;
  } else if (Array.isArray(data)) {
    if (typeof data[0] === "string") {
      text = data[0];
    } else if (data[0]?.generated_text) {
      text = data[0].generated_text;
    } else {
      text = JSON.stringify(data);
    }
  } else if (data?.generated_text) {
    text = data.generated_text;
  } else {
    text = JSON.stringify(data);
  }

  return { data, text };
}

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  const userId = payload?.userId;

  let body: {
    provider?: string;
    prompt?: string;
    top_k?: number;
    use_memory?: boolean;
    model?: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const provider = (body.provider || "local").toString();
  const prompt = (body.prompt || "").toString();
  const topK = Number(body.top_k || 5);
  const useMemory = Boolean(body.use_memory);
  const model = (body.model || "").toString().trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    if (provider === "local") {
      const localResult = await fetchLocalQuery(prompt, topK, userId);
      return NextResponse.json({
        provider: "local",
        model: "local-retrieval",
        prompt,
        result: localResult,
      });
    }

    let memoryContext = "";
    if (useMemory && userId) {
      const localResult = await fetchLocalQuery(prompt, topK, userId);
      memoryContext = buildMemoryContext(localResult.results || []);
    }

    const promptInput = memoryContext
      ? `Here is the user's local memory context:\n\n${memoryContext}\n\nUser question:\n${prompt}`
      : prompt;

    if (provider === "openai") {
      const openaiModel = model || DEFAULT_OPENAI_MODEL;
      const openaiResponse = await callOpenAI(openaiModel, promptInput);
      const text = openaiResponse.choices?.[0]?.message?.content ?? openaiResponse.choices?.[0]?.text ?? "";

      return NextResponse.json({
        provider: "openai",
        model: openaiModel,
        prompt,
        use_memory: useMemory,
        memory_context: memoryContext,
        response: text,
        raw: openaiResponse,
      });
    }

    if (provider === "claude") {
      const anthropicModel = model || DEFAULT_ANTHROPIC_MODEL;
      const anthropicResponse = await callAnthropic(anthropicModel, promptInput);
      const text = anthropicResponse.completion || "";

      return NextResponse.json({
        provider: "claude",
        model: anthropicModel,
        prompt,
        use_memory: useMemory,
        memory_context: memoryContext,
        response: text,
        raw: anthropicResponse,
      });
    }

    if (provider === "ollama") {
      const ollamaModel = model || DEFAULT_OLLAMA_MODEL;
      const ollamaResponse = await callOllama(ollamaModel, promptInput);
      const text = ollamaResponse.choices?.[0]?.message?.content ?? ollamaResponse.output?.[0]?.content?.[0]?.text ?? JSON.stringify(ollamaResponse);

      return NextResponse.json({
        provider: "ollama",
        model: ollamaModel,
        prompt,
        use_memory: useMemory,
        memory_context: memoryContext,
        response: text,
        raw: ollamaResponse,
      });
    }

    if (provider === "huggingface") {
      const hfResponse = await callHuggingFace(model, promptInput);
      return NextResponse.json({
        provider: "huggingface",
        model,
        prompt,
        use_memory: useMemory,
        memory_context: memoryContext,
        response: hfResponse.text,
        raw: hfResponse.data,
      });
    }

    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "LLM request failed" }, { status: 500 });
  }
}
