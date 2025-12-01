import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  // When running in Docker, use the service name 'backend'
  // Otherwise use localhost for local development
  const apiHost = process.env.API_HOST_INTERNAL || (process.env.DOCKER === 'true' ? 'backend' : 'localhost');
  const apiPort = process.env.API_PORT_INTERNAL || '8000';
  return `http://${apiHost}:${apiPort}/api`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/auth/signup`;
    
    console.log(`[SIGNUP] URL: ${backendUrl}, Body:`, JSON.stringify(body));
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`[SIGNUP] Status: ${response.status}`);
    const text = await response.text();
    console.log(`[SIGNUP] Response: ${text}`);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { error: text || `Backend returned ${response.status}` };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
