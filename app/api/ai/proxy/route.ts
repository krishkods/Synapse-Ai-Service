import { NextResponse } from 'next/server';

import {
  extractTokenFromRequest,
  verifyToken,
} from '@/lib/auth';

const AI_SERVICE_URL =
  process.env.SYNAPSE_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  'http://localhost:8000';

const REQUEST_TIMEOUT_MS = 15000;

type QueryPayload = {
  query?: string;
  user_id?: string;
  top_k?: number;
  include_working_memory?: boolean;
};

function createErrorResponse(
  message: string,
  status: number = 500
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(
  request: Request
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    // ------------------------------------------------
    // Parse Body
    // ------------------------------------------------

    let body: QueryPayload;

    try {
      body =
        await request.json();
    } catch {
      clearTimeout(timeout);

      return createErrorResponse(
        'Invalid JSON body',
        400
      );
    }

    // ------------------------------------------------
    // Validate Query
    // ------------------------------------------------

    const query =
      body.query?.trim();

    if (!query) {
      clearTimeout(timeout);

      return createErrorResponse(
        'Query is required',
        400
      );
    }

    // ------------------------------------------------
    // Auth
    // ------------------------------------------------

    const token =
      extractTokenFromRequest(
        request
      );

    const payload = token
      ? verifyToken(token)
      : null;

    // ------------------------------------------------
    // Headers
    // ------------------------------------------------

    const headers: Record<
      string,
      string
    > = {
      'Content-Type':
        'application/json',
      Accept:
        'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!payload) {
      clearTimeout(timeout);
      return createErrorResponse('Unauthorized', 401);
    }

    // ------------------------------------------------
    // Payload
    // ------------------------------------------------

    const proxyPayload = {
      query,
      top_k:
        body.top_k ?? 10,
      include_working_memory:
        body.include_working_memory ??
        true,
    };

    // ------------------------------------------------
    // Backend Request
    // ------------------------------------------------

    const response =
      await fetch(
        `${AI_SERVICE_URL}/retrieval/search`,
        {
          method: 'POST',

          headers,

          body: JSON.stringify(
            proxyPayload
          ),

          cache: 'no-store',

          signal:
            controller.signal,
        }
      );

    clearTimeout(timeout);

    // ------------------------------------------------
    // Parse Backend Response
    // ------------------------------------------------

    let data: unknown;

    try {
      data =
        await response.json();
    } catch {
      return createErrorResponse(
        'Invalid response from cognitive engine',
        502
      );
    }

    // ------------------------------------------------
    // Forward Response
    // ------------------------------------------------

    return NextResponse.json(
      data,
      {
        status:
          response.status,
      }
    );
  } catch (
    error: unknown
  ) {
    clearTimeout(timeout);

    if (
      error instanceof Error &&
      error.name ===
        'AbortError'
    ) {
      return createErrorResponse(
        'Cognitive retrieval timeout',
        504
      );
    }

    return createErrorResponse(
      error instanceof Error
        ? error.message
        : 'Unknown proxy error',
      500
    );
  }
}