
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Apply Clerk's middleware to all routes except for static files and API routes that don't need auth.
export default clerkMiddleware();

export const config = {
  matcher: [
    /*
      Match all request paths except:
      - /api/auth/:path* (Clerk auth routes)
      - /_next/:path* (Next.js internals)
      - /favicon.ico
    */
    '/((?!api/auth|_next|favicon.ico).*)',
  ],
};
