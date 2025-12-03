import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST || process.env.API_HOST || 'localhost';
  const apiPort = process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || '8000';
  return `http://${apiHost}:${apiPort}/api`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/auth/login`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth login API route error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
