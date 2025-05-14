'use client';

import React, { useEffect } from 'react';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { errorLogger } from '@/lib/errors/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to our error reporting system
    errorLogger(error, { source: 'client-error-boundary' });
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-void flex flex-col items-center justify-center p-4">
      <ResponsiveContainer maxWidth="tablet" className="text-center py-12">
        <div className="space-y-6">
          {/* Cosmic error visual */}
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-red-500 opacity-20 select-none animate-pulse">
              !
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-space border-4 border-red-500/30 relative overflow-hidden">
                <div className="absolute -inset-1 opacity-30 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-spin duration-6000" />
                <div className="absolute inset-2 bg-dark-void rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                  <span className="text-xl font-bold text-red-500">!</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-starlight-white">
            Cosmic Anomaly Detected
          </h1>

          <p className="text-nebula-veil max-w-md mx-auto">
            The stars have temporarily misaligned. Our cosmic engineers are realigning the celestial mechanics.
          </p>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-4 bg-red-900/20 rounded text-left overflow-auto max-h-40 text-sm w-full max-w-md mx-auto">
              <p className="font-mono text-red-400">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs text-red-400 overflow-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="pt-6 space-y-4">
            <button
              onClick={reset}
              className="inline-block px-6 py-3 bg-cosmic-purple text-starlight-white rounded-md hover:bg-cosmic-purple/90 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reset the Cosmos
              </span>
            </button>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="/"
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Return to Home
              </a>
              <span className="hidden md:inline text-stardust-silver">•</span>
              <a
                href="/dashboard"
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Your Dashboard
              </a>
              <span className="hidden md:inline text-stardust-silver">•</span>
              <button
                onClick={() => window.history.back()}
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}