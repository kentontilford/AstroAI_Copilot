import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/use-toast';

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

/**
 * Helper to mock the fetch API for testing API routes
 */
export function mockFetch(status: number, responseBody: any) {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(responseBody),
      text: () => Promise.resolve(JSON.stringify(responseBody)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  });
}

/**
 * Helper to wait for multiple promises to resolve
 */
export function waitForPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Helper to create a NextRequest for testing API routes
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  body?: any;
  nextUrl?: {
    pathname?: string;
    search?: string;
  };
}) {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    headers = {},
    cookies = {},
    body,
    nextUrl = {},
  } = options;

  const req = {
    method,
    url,
    headers: new Headers(headers),
    cookies,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    nextUrl: {
      pathname: nextUrl.pathname || '/',
      search: nextUrl.search || '',
    },
    ip: '127.0.0.1',
  };

  return req;
}

/**
 * Helper to create a mock NextResponse
 */
export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    headers: new Headers(),
  };
  return res;
}