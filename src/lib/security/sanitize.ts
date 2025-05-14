/**
 * Sanitize a string of user input to prevent XSS attacks.
 * This is a simple implementation - consider using a library like DOMPurify
 * for more comprehensive sanitization in production.
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Replace special characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize an object recursively to prevent XSS attacks.
 * Only sanitizes string values.
 */
export function sanitizeObject<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  
  const result = { ...data };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      if (typeof result[key] === 'string') {
        result[key] = sanitizeString(result[key]);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = sanitizeObject(result[key]);
      }
    }
  }
  
  return result;
}

/**
 * Sanitize an array recursively to prevent XSS attacks.
 */
export function sanitizeArray<T>(data: T[]): T[] {
  if (!Array.isArray(data)) return data;
  
  return data.map(item => {
    if (typeof item === 'string') {
      return sanitizeString(item) as unknown as T;
    } else if (typeof item === 'object' && item !== null) {
      return Array.isArray(item) ? sanitizeArray(item) : sanitizeObject(item);
    }
    return item;
  });
}

/**
 * Sanitize any input - detects type and applies appropriate sanitization
 */
export function sanitize<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  } else if (Array.isArray(input)) {
    return sanitizeArray(input) as unknown as T;
  } else if (typeof input === 'object' && input !== null) {
    return sanitizeObject(input);
  }
  return input;
}