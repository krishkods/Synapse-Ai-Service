import { NextResponse } from 'next/server';

import {
  extractTokenFromRequest,
  verifyToken,
} from '@/lib/auth';

const AI_SERVICE_URL =
  process.env.SYNAPSE_AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  'http://localhost:8000';

const REQUEST_TIMEOUT_MS = 10000;

function errorResponse(
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

export async function GET(
  request: Request
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    // ----------------------------------------
    // Auth
    // ----------------------------------------

    const token =
      extractTokenFromRequest(
        request
      );

    const payload = token
      ? verifyToken(token)
      : null;

    // ----------------------------------------
    // Query Params
    // ----------------------------------------

    const url = new URL(
      request.url
    );

    const queryUserId =
      url.searchParams.get(
        'user_id'
      );

    const effectiveUserId =
      queryUserId ||
      payload?.userId ||
      '';

    // ----------------------------------------
    // Headers
    // ----------------------------------------

    const headers: Record<
      string,
      string
    > = {
      Accept:
        'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!payload) {
      clearTimeout(timeout);
      return errorResponse('Unauthorized', 401);
    }

    const targetUrl = `${AI_SERVICE_URL}/ai/stats`;

    // ----------------------------------------
    // Backend Request
    // ----------------------------------------

    const response =
      await fetch(
        targetUrl,
        {
          method: 'GET',
          headers,
          cache:
            'no-store',
          signal:
            controller.signal,
        }
      );

    clearTimeout(timeout);

    // ----------------------------------------
    // Parse Response
    // ----------------------------------------

    let data: unknown;

    try {
      data =
        await response.json();
    } catch {
      return errorResponse(
        'Invalid stats response from cognitive engine',
        502
      );
    }

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
      return errorResponse(
        'Stats request timeout',
        504
      );
    }

    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Unknown stats error',
      500
    );
  }
}