import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  // When running in Docker, use the service name 'backend'
  // Otherwise use localhost for local development
  const apiHost = process.env.DOCKER === 'true' ? 'backend' : (process.env.API_HOST || 'localhost');
  const apiPort = process.env.API_PORT || '8000';
  return `http://${apiHost}:${apiPort}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const auth_header = request.headers.get('authorization');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/api${path}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (auth_header) {
      headers['Authorization'] = auth_header;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Company GET API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const auth_header = request.headers.get('authorization');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/api${path}`;
    
    console.log(`[PROXY] URL: ${backendUrl}, Auth: ${auth_header ? 'yes' : 'no'}`);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (auth_header) {
      headers['Authorization'] = auth_header;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log(`[PROXY] Status: ${response.status}`);
    const text = await response.text();
    console.log(`[PROXY] Response: ${text}`);

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
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const auth_header = request.headers.get('authorization');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/api${path}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (auth_header) {
      headers['Authorization'] = auth_header;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
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
    console.error('Company PUT API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const auth_header = request.headers.get('authorization');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  try {
    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/api${path}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (auth_header) {
      headers['Authorization'] = auth_header;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Company DELETE API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
