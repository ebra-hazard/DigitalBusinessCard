import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST || process.env.API_HOST || 'localhost';
  const apiPort = process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || '8000';
  return `http://${apiHost}:${apiPort}/api`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company_slug = searchParams.get('company_slug');
  const employee_slug = searchParams.get('employee_slug');

  if (!company_slug || !employee_slug) {
    return NextResponse.json(
      { error: 'Missing parameters' },
      { status: 400 }
    );
  }

  try {
    const apiBase = getBackendUrl();
    const backendUrl = `${apiBase}/card/${company_slug}/${employee_slug}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card data' },
      { status: 500 }
    );
  }
}
