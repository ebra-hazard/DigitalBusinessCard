import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST || process.env.API_HOST || 'localhost';
  const apiPort = process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || '8000';
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
    console.error('Company POST API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
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
