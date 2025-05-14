'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  maxWidth?: number;
  className?: string;
  contentClassName?: string;
  showArrow?: boolean;
}

/**
 * Tooltip component for providing additional information on hover/focus
 * Accessible and responsive with positioning options
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 250,
  className,
  contentClassName,
  showArrow = true,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [delayTimeout, setDelayTimeout] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const timeout = setTimeout(() => setVisible(true), delay);
    setDelayTimeout(timeout);
  };

  const hideTooltip = () => {
    if (delayTimeout) clearTimeout(delayTimeout);
    setVisible(false);
  };

  // Position classes for the tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  };

  // Arrow position classes
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* Tooltip trigger */}
      <div className="inline-flex">{children}</div>

      {/* Tooltip content */}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-starlight-white bg-dark-void border border-cosmic-purple rounded shadow-lg',
            'transition-opacity duration-200',
            positionClasses[position],
            contentClassName
          )}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {content}
          {showArrow && (
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-dark-void',
                arrowClasses[position]
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  className?: string;
}

/**
 * InfoTooltip provides a small info icon with a tooltip
 * Useful for providing additional context for form fields or UI elements
 */
export function InfoTooltip({
  content,
  position = 'top',
  maxWidth,
  className,
}: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position} maxWidth={maxWidth}>
      <span
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-nebula-veil/20 text-stardust-silver',
          'cursor-help ml-1',
          className
        )}
        tabIndex={0}
        role="button"
        aria-label="More information"
      >
        i
      </span>
    </Tooltip>
  );
}

interface GuidanceTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
  highlight?: boolean;
}

/**
 * GuidanceTooltip wraps elements to provide tutorial-style guidance
 * Can optionally highlight the element to draw attention to it
 */
export function GuidanceTooltip({
  content,
  position = 'top',
  maxWidth,
  className,
  children,
  highlight = false,
}: GuidanceTooltipProps) {
  return (
    <Tooltip content={content} position={position} maxWidth={maxWidth}>
      <span
        className={cn(
          'relative inline-block',
          highlight && 'animate-pulse ring-2 ring-supernova-teal rounded',
          className
        )}
        tabIndex={0}
      >
        {children}
      </span>
    </Tooltip>
  );
}