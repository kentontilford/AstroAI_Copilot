'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageTransitionProps {
  children: React.ReactNode;
  enableTransition?: boolean;
  loadingDelay?: number;
  minLoadingTime?: number;
}

/**
 * Page transition component that shows loading state and animates page transitions
 * 
 * This component tracks route changes and shows a loading state when navigating
 * between pages, then animates the new page content in.
 */
export function PageTransition({
  children,
  enableTransition = true,
  loadingDelay = 200,
  minLoadingTime = 500,
}: PageTransitionProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(children);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [prevRoute, setPrevRoute] = useState('');
  
  // Update content when children change (new page)
  useEffect(() => {
    const currentRoute = pathname + searchParams.toString();
    
    // If this is a new route, start loading
    if (prevRoute !== currentRoute && prevRoute !== '') {
      const loadingIndicatorTimeout = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, loadingDelay);
      
      setIsLoading(true);
      
      // Ensure minimum loading time for consistency
      const minimumLoadingTimeout = setTimeout(() => {
        setContent(children);
        setIsLoading(false);
        setShowLoadingIndicator(false);
      }, minLoadingTime);
      
      return () => {
        clearTimeout(loadingIndicatorTimeout);
        clearTimeout(minimumLoadingTimeout);
      };
    } else {
      // First load or same route
      setContent(children);
      setPrevRoute(currentRoute);
    }
  }, [children, pathname, searchParams, prevRoute, loadingDelay, minLoadingTime]);
  
  // Update previous route when route changes
  useEffect(() => {
    const currentRoute = pathname + searchParams.toString();
    if (prevRoute !== currentRoute) {
      setPrevRoute(currentRoute);
    }
  }, [pathname, searchParams, prevRoute]);
  
  if (!enableTransition) {
    return <>{children}</>;
  }
  
  return (
    <>
      {showLoadingIndicator && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-dark-space/50 backdrop-blur-sm z-50"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner 
            size="lg" 
            color="primary" 
            label="Loading page..." 
          />
        </div>
      )}
      
      <div
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {content}
      </div>
    </>
  );
}