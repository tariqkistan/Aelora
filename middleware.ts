import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

// Define supported locales
export const locales = ['en', 'es', 'fr', 'de'];
export const defaultLocale = 'en';

// Create internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

// Add custom middleware logic
export default function middleware(request: NextRequest) {
  // Apply internationalization middleware
  return intlMiddleware(request);
}

// Configure middleware to match specific paths
export const config = {
  // Match all routes except for:
  // - API routes (/api/*)
  // - Static files (/_next/*, /images/*, /favicon.ico, etc.)
  matcher: ['/((?!api|_next|images|favicon.ico|.*\\.(?:jpg|png|gif|ico|svg)).*)']
}; 