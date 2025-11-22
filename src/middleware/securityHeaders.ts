/**
 * Security middleware for API requests
 * Adds security headers and validates requests
 */

import { checkSecureConnection } from '@/lib/securityUtils';

/**
 * Initialize security checks on app load
 */
export const initSecurityChecks = (): void => {
  // Check for secure connection
  checkSecureConnection();
  
  // Warn about browser security features
  if (import.meta.env.DEV) {
    console.log('%c🔒 Modo de Desenvolvimento', 'color: orange; font-weight: bold;');
    console.log('%cTokens visíveis no DevTools são esperados em desenvolvimento.', 'color: orange;');
    console.log('%cEm produção, use sempre HTTPS e nunca exponha tokens em logs.', 'color: orange;');
  }
  
  // Prevent console access in production
  if (import.meta.env.PROD) {
    disableConsoleInProduction();
  }
};

/**
 * Disable console methods in production to prevent token exposure
 */
const disableConsoleInProduction = (): void => {
  const noop = () => {};
  
  // Keep error but sanitize it
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Only show sanitized errors in production
    const sanitized = args.map(arg => 
      typeof arg === 'string' ? arg.replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED]') : '[REDACTED]'
    );
    originalError(...sanitized);
  };
  
  // Disable other console methods
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.warn = noop;
};

/**
 * Content Security Policy meta tag (should be added to index.html)
 */
export const getCSPMetaContent = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Vite HMR in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://hybuoksgodflxjhjoufv.supabase.co wss://hybuoksgodflxjhjoufv.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

/**
 * Security headers recommendations for the server
 * Note: These should be configured on the hosting server/CDN
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
