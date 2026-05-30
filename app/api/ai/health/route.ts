import { NextResponse } from 'next/server';

const AI_SERVICE_URL =
  process.env.SYNAPSE_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  'http://localhost:8000';

const REQUEST_TIMEOUT_MS = 5000;

type HealthResponse = {
  status: string;
  service?: string;
  started_at?: string;

  cognition_stack?: {
    embedding_model?: {
      loaded?: boolean;
      model?: string;
      vector_size?: number;
    };

    reranker_model?: {
      loaded?: boolean;
      model?: string;
    };
  };

  infrastructure?: {
    qdrant?: {
      connected?: boolean;
      collection?: string;
    };

    redis?: {
      connected?: boolean;
    };
  };
};

function createOfflineResponse(): HealthResponse {
  return {
    status: 'offline',

    service:
      'synapse-cognitive-engine',

    cognition_stack: {
      embedding_model: {
        loaded: false,
      },

      reranker_model: {
        loaded: false,
      },
    },

    infrastructure: {
      qdrant: {
        connected: false,
      },

      redis: {
        connected: false,
      },
    },

    started_at: undefined,
  };
}

export async function GET() {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    const response =
      await fetch(
        `${AI_SERVICE_URL}/health`,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json',
          },
          cache: 'no-store',
          signal:
            controller.signal,
        }
      );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        createOfflineResponse(
        ),
        {
          status: 503,
        }
      );
    }

    const data: HealthResponse =
      await response.json();

    return NextResponse.json(
      {
        ...data,

        status:
          data.status ||
          'healthy',

        service:
          data.service ||
          'synapse-cognitive-engine',
      },
      {
        status: 200,
      }
    );
  } catch {
    clearTimeout(timeout);

    return NextResponse.json(
      createOfflineResponse(
      ),
      {
        status: 503,
      }
    );
  }
}
