import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Handle API routes with CORS
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to API responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    return response;
  }

  // Skip Next.js internal routes
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') ||
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  
  // Serve client assets (CSS, JS, images)
  if (pathname.startsWith('/assets/')) {
    return NextResponse.rewrite(new URL(`/client${pathname}`, request.url));
  }
  
  // Serve client index.html for all other routes (SPA routing)
  return NextResponse.rewrite(new URL('/client/index.html', request.url));
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
