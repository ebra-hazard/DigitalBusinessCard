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
    const backendUrl = `${apiBase}/card/${company_slug}/${employee_slug}/qr-vcard`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`QR backend returned ${response.status}`);
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Get image data from response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Return as PNG image
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('QR code API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    );
  }
}
