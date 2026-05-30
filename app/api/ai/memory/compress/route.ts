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

export async function POST(request: Request) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const token = extractTokenFromRequest(request);
    const authPayload = token ? verifyToken(token) : null;

    if (!authPayload || !token) {
      clearTimeout(timeout);
      return errorResponse('Unauthorized', 401);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${AI_SERVICE_URL}/ai/compress`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: unknown) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      return errorResponse('Compress request timeout', 504);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Unknown compress error',
      500
    );
  }
}
