import React from 'react';
import Link from 'next/link';
import { ResponsiveContainer } from '@/components/layout/responsive-container';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-void flex flex-col items-center justify-center p-4">
      <ResponsiveContainer maxWidth="tablet" className="text-center py-12">
        <div className="space-y-6">
          {/* Cosmic 404 visual */}
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-cosmic-purple opacity-20 select-none animate-pulse">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-space border-4 border-nebula-veil/30 relative overflow-hidden">
                <div className="absolute -inset-1 opacity-30 rounded-full bg-gradient-to-r from-cosmic-purple via-supernova-teal to-cosmic-purple animate-spin duration-6000" />
                <div className="absolute inset-2 bg-dark-void rounded-full" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-supernova-teal shadow-glow-teal animate-ping" />
                <div className="absolute top-3/4 left-1/4 w-0.5 h-0.5 rounded-full bg-cosmic-purple shadow-glow-purple animate-ping delay-700" />
                <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 rounded-full bg-starlight-white animate-ping delay-300" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-starlight-white">
            Lost in the Cosmic Void
          </h1>

          <p className="text-nebula-veil max-w-md mx-auto">
            The celestial page you're looking for has drifted beyond our current star charts.
            The stars have moved, or perhaps this cosmic destination never existed.
          </p>

          <div className="pt-6 space-y-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-cosmic-purple text-starlight-white rounded-md hover:bg-cosmic-purple/90 transition-colors"
            >
              Return to Home Planet
            </Link>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Your Dashboard
              </Link>
              <span className="hidden md:inline text-stardust-silver">•</span>
              <Link
                href="/chat"
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Ask the Stars
              </Link>
              <span className="hidden md:inline text-stardust-silver">•</span>
              <Link
                href="/settings"
                className="text-nebula-veil hover:text-starlight-white transition-colors"
              >
                Adjust Your Settings
              </Link>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}