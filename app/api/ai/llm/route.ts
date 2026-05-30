import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,

      status: 'deprecated',

      service:
        'synapse-cognitive-engine',

      code:
        'LLM_ORCHESTRATION_DISABLED',

      message:
        'Synapse currently operates as a cognitive memory engine with semantic retrieval and structured memory orchestration. Direct LLM orchestration is disabled in this build.',

      architecture: {
        mode: 'manual-memory',

        capabilities: [
          'semantic retrieval',
          'memory storage',
          'structured context',
          'reranked cognition',
          'working memory',
        ],

        disabled: [
          'provider orchestration',
          'chat completion routing',
          'multi-llm execution',
        ],
      },

      available_endpoints: {
        memory: '/memory',
        retrieval:
          '/retrieval/search',
        extraction:
          '/ai/extract-memory',
        health: '/health',
        models: '/model',
      },
    },
    {
      status: 410,
    }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,

      status: 'deprecated',

      message:
        'LLM orchestration endpoints are disabled in this Synapse build.',
    },
    {
      status: 410,
    }
  );
}