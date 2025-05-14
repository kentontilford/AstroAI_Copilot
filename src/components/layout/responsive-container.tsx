'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type DeviceSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: DeviceSize | 'full';
  padded?: boolean;
  centered?: boolean;
}

/**
 * ResponsiveContainer provides a consistent way to handle responsive layouts.
 * It applies appropriate max-widths and padding based on device size.
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'desktop',
  padded = true,
  centered = true,
}: ResponsiveContainerProps) {
  // Map of device sizes to max-width classes
  const maxWidthClasses = {
    mobile: 'max-w-md', // 448px
    tablet: 'max-w-2xl', // 672px
    desktop: 'max-w-4xl', // 896px
    wide: 'max-w-6xl', // 1152px
    full: ''
  };

  return (
    <div
      className={cn(
        'w-full',
        padded && 'px-4 sm:px-6 md:px-8',
        centered && 'mx-auto',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveGrid provides a responsive grid layout that adjusts columns based on screen size
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  // Build grid columns classes based on breakpoints
  const gridColsClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  // Map gap sizes to classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid w-full',
        gridColsClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveStack provides a vertical stack on small screens 
 * and horizontal layout on larger screens
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export function ResponsiveStack({
  children,
  className,
  breakpoint = 'md',
  spacing = 'md',
  alignment = 'start',
}: ResponsiveStackProps) {
  // Map breakpoints to flex direction classes
  const breakpointClasses = {
    sm: 'flex-col sm:flex-row',
    md: 'flex-col md:flex-row',
    lg: 'flex-col lg:flex-row',
  };

  // Map spacing to gap classes
  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  // Map alignment to justify classes
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      className={cn(
        'flex w-full',
        breakpointClasses[breakpoint],
        spacingClasses[spacing],
        alignmentClasses[alignment],
        className
      )}
    >
      {children}
    </div>
  );
}
