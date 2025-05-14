'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  autoFocus?: boolean;
  returnFocus?: boolean;
}

/**
 * FocusTrap component to trap focus within a container for accessibility
 * Useful for modals, dialogs, and other focused UI elements
 */
export function FocusTrap({
  children,
  active = true,
  className,
  autoFocus = true,
  returnFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (active && returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      // Return focus to the previous element when unmounting
      if (active && returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, returnFocus]);

  // Auto-focus the first focusable element when the trap becomes active
  useEffect(() => {
    if (!active || !autoFocus || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [active, autoFocus]);

  // Handle tab key to trap focus
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || !containerRef.current || e.key !== 'Tab') return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.tabIndex !== -1);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Shift + Tab: wrap from first to last
    if (e.shiftKey && activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // Tab: wrap from last to first
    else if (!e.shiftKey && activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

interface ModalContainerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  contentClassName?: string;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  title?: string;
}

/**
 * ModalContainer component that combines focus trapping with standard modal UI
 * Handles keyboard interactions and outside clicks for closing
 */
export function ModalContainer({
  children,
  isOpen,
  onClose,
  className,
  contentClassName,
  closeOnEsc = true,
  closeOnOutsideClick = true,
  title,
}: ModalContainerProps) {
  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEsc, isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-dark-space/50 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      <FocusTrap
        active={isOpen}
        className={cn(
          'bg-dark-void border border-cosmic-purple rounded-lg shadow-xl max-w-md w-full p-6',
          'animate-in zoom-in-95 duration-300',
          contentClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-xl font-semibold text-starlight-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-stardust-silver hover:text-starlight-white p-1 rounded-full"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </FocusTrap>
    </div>
  );
}