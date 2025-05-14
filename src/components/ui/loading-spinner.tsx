import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
  centered?: boolean;
}

export function LoadingSpinner({
  className,
  size = 'md',
  color = 'primary',
  label,
  centered = false,
}: LoadingSpinnerProps) {
  // Size mappings for the spinner dimensions
  const sizeClasses = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-4',
  };

  // Color mappings for the spinner
  const colorClasses = {
    primary: 'border-t-supernova-teal',
    secondary: 'border-t-cosmic-purple',
    white: 'border-t-starlight-white',
  };

  // Base classes for the spinner
  const spinnerClasses = cn(
    'animate-spin rounded-full border-transparent',
    sizeClasses[size],
    colorClasses[color],
    className
  );

  // If centered, wrap in a centering container
  if (centered) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className={spinnerClasses} />
        {label && (
          <span className="mt-2 text-sm text-stardust-silver">
            {label}
          </span>
        )}
        {!label && <span className="sr-only">Loading...</span>}
      </div>
    );
  }

  // Return just the spinner with appropriate ARIA attributes
  return (
    <div role="status" aria-live="polite" className="inline-flex flex-col items-center">
      <div className={spinnerClasses} />
      {label && (
        <span className="mt-2 text-sm text-stardust-silver">
          {label}
        </span>
      )}
      {!label && <span className="sr-only">Loading...</span>}
    </div>
  );
}