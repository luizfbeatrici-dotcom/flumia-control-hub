/**
 * Security utilities for protecting sensitive data
 * IMPORTANT: Never log tokens, sessions, or auth data to console in production
 */

/**
 * Sanitize error messages to prevent token leakage
 */
export const sanitizeError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  const message = typeof error === 'string' ? error : error.message || 'Erro desconhecido';
  
  // Remove potential tokens from error messages
  return message
    .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[TOKEN_REDACTED]')
    .replace(/Bearer\s+[^\s]+/g, 'Bearer [TOKEN_REDACTED]')
    .replace(/token[=:]\s*[^\s&]+/gi, 'token=[TOKEN_REDACTED]');
};

/**
 * Safe console logger that redacts sensitive information
 */
export const safeLog = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data ? sanitizeData(data) : '');
    }
  },
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error ? sanitizeError(error) : '');
    } else {
      // In production, only log sanitized messages
      console.error(`[ERROR] ${message}`);
    }
  },
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, data ? sanitizeData(data) : '');
    }
  }
};

/**
 * Sanitize data objects to prevent accidental token exposure
 */
const sanitizeData = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return sanitizeError(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      // Redact sensitive fields
      if (['token', 'access_token', 'refresh_token', 'session', 'auth', 'password', 'secret'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Check if the current connection is secure (HTTPS)
 */
export const isSecureConnection = (): boolean => {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Log security warning if connection is not secure
 */
export const checkSecureConnection = (): void => {
  if (!isSecureConnection() && import.meta.env.PROD) {
    console.warn('⚠️ AVISO DE SEGURANÇA: Conexão não segura detectada. Use HTTPS em produção.');
  }
};

/**
 * Validate token format without exposing it
 */
export const isValidTokenFormat = (token: string): boolean => {
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Get masked version of sensitive data for display purposes
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) return '****';
  return data.slice(0, visibleChars) + '*'.repeat(Math.min(data.length - visibleChars, 8));
};
