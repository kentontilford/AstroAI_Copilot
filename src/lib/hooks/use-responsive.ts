import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Custom hook to detect the current breakpoint based on window width
 * Matches Tailwind CSS default breakpoints
 */
export function useBreakpoint() {
  // Default to the largest breakpoint during SSR
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('2xl');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Set initial width
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update breakpoint when width changes
  useEffect(() => {
    if (width === 0) return; // Skip during SSR

    // Find the appropriate breakpoint
    if (width < breakpoints.sm) {
      setBreakpoint('xs');
    } else if (width < breakpoints.md) {
      setBreakpoint('sm');
    } else if (width < breakpoints.lg) {
      setBreakpoint('md');
    } else if (width < breakpoints.xl) {
      setBreakpoint('lg');
    } else if (width < breakpoints['2xl']) {
      setBreakpoint('xl');
    } else {
      setBreakpoint('2xl');
    }
  }, [width]);

  return breakpoint;
}

/**
 * Custom hook to check if the current breakpoint matches a specific query
 * @param query The breakpoint to check for, can be a specific breakpoint or a range
 */
export function useResponsive(query: Breakpoint | `>${Breakpoint}` | `<${Breakpoint}`) {
  const currentBreakpoint = useBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  // Check if the breakpoint matches the query
  const matches = () => {
    // If query is a simple breakpoint, check exact match
    if (Object.keys(breakpoints).includes(query as string)) {
      return currentBreakpoint === query;
    }

    // If query is a range (e.g., ">md" or "<lg")
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    if (query.startsWith('>')) {
      const targetBreakpoint = query.substring(1) as Breakpoint;
      const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
      return currentIndex > targetIndex;
    }

    if (query.startsWith('<')) {
      const targetBreakpoint = query.substring(1) as Breakpoint;
      const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
      return currentIndex < targetIndex;
    }

    // Fallback
    return false;
  };

  return matches();
}

/**
 * Utility hook to check if the current screen is considered mobile
 */
export function useIsMobile() {
  return useResponsive('<md');
}

/**
 * Utility hook to check if the current screen is considered desktop
 */
export function useIsDesktop() {
  return useResponsive('>md');
}

/**
 * Hook to get current window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}