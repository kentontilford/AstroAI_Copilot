'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left';
  isOptional?: boolean;
  path?: string; // Route path where this step should be shown
}

interface UserGuideProps {
  steps: GuideStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  startIndex?: number;
  className?: string;
  showProgress?: boolean;
  autoStart?: boolean;
  localStorageKey?: string; // To remember progress between sessions
}

/**
 * UserGuide component for step-by-step onboarding tutorials
 * Provides an interactive guided tour of the application
 */
export function UserGuide({
  steps,
  onComplete,
  onSkip,
  startIndex = 0,
  className,
  showProgress = true,
  autoStart = false,
  localStorageKey = 'astrology-user-guide-progress',
}: UserGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(startIndex);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const pathname = usePathname();

  const currentStep = steps[currentStepIndex];

  // Check local storage for saved progress
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorageKey) {
      const savedProgress = localStorage.getItem(localStorageKey);
      if (savedProgress) {
        const { stepIndex, completed } = JSON.parse(savedProgress);
        if (!completed && stepIndex < steps.length) {
          setCurrentStepIndex(stepIndex);
          if (autoStart) setIsVisible(true);
        }
      }
    }
  }, [autoStart, localStorageKey, steps.length]);

  // Check if current step's path matches current URL path
  useEffect(() => {
    if (isVisible && currentStep.path && pathname !== currentStep.path) {
      // Save progress and hide guide if path doesn't match
      saveProgress();
      setIsVisible(false);
    }
  }, [pathname, currentStep, isVisible]);

  // Find and highlight the target element if specified
  useEffect(() => {
    if (isVisible && currentStep.targetElement) {
      // Find element and highlight it
      const element = document.querySelector(currentStep.targetElement);
      setHighlightedElement(element);

      // Add highlight class to the element
      if (element) {
        element.classList.add('guide-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return () => {
        // Remove highlight when component unmounts or step changes
        if (element) {
          element.classList.remove('guide-highlight');
        }
      };
    }
  }, [currentStep, isVisible]);

  // Save progress to local storage
  const saveProgress = () => {
    if (typeof window !== 'undefined' && localStorageKey) {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          stepIndex: currentStepIndex,
          completed: currentStepIndex >= steps.length - 1,
        })
      );
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
    saveProgress();
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
    saveProgress();
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined' && localStorageKey) {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ stepIndex: steps.length - 1, completed: true })
      );
    }
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  if (!isVisible) {
    return (
      <button
        className="fixed bottom-4 right-4 z-40 bg-cosmic-purple text-starlight-white p-2 rounded-full shadow-lg hover:bg-cosmic-purple/90"
        onClick={() => setIsVisible(true)}
        aria-label="Open guide"
        title="Open Guide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12" y2="17"></line>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-space/50 backdrop-blur-sm">
      <div
        className={cn(
          'bg-dark-void border border-cosmic-purple rounded-lg shadow-xl max-w-md w-full p-6',
          'animate-in fade-in-50 zoom-in-95 duration-300',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="guide-title" className="text-xl font-semibold text-starlight-white">
            {currentStep.title}
          </h2>
          <button
            onClick={handleSkip}
            className="text-stardust-silver hover:text-starlight-white p-1"
            aria-label="Close guide"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 text-nebula-veil">{currentStep.description}</div>

        {showProgress && (
          <div className="flex justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full mx-1',
                  currentStepIndex === index
                    ? 'bg-supernova-teal'
                    : 'bg-nebula-veil/30'
                )}
                role="presentation"
              />
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={cn(
              'px-4 py-2 rounded-md border border-nebula-veil text-nebula-veil',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'hover:bg-nebula-veil/10'
            )}
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentStep.isOptional && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-md text-stardust-silver hover:underline"
              >
                Skip
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-md bg-cosmic-purple text-starlight-white hover:bg-cosmic-purple/90"
            >
              {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick method to start the user guide with a predefined set of steps
 */
export function startDashboardGuide() {
  // Create and mount the component dynamically if needed
  // This is a simplified example, actual implementation might be more complex
  const guideRoot = document.createElement('div');
  guideRoot.id = 'user-guide-root';
  document.body.appendChild(guideRoot);
  
  // This would be handled by a framework renderer in practice
  // For this example, we're just showing how it would be structured
  const dashboardSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Your Cosmic Dashboard',
      description: 'This guide will help you navigate your astrological journey. Let\'s explore the key features together.',
      path: '/dashboard',
    },
    {
      id: 'natal-chart',
      title: 'Your Natal Chart',
      description: 'Here you can see your birth chart with all planetary positions. Click any planet to see detailed interpretations.',
      targetElement: '#natal-chart-section',
      path: '/dashboard',
    },
    {
      id: 'daily-transit',
      title: 'Daily Transits',
      description: 'Check how current planetary movements are affecting your chart today.',
      targetElement: '#transit-section',
      path: '/dashboard',
    },
    {
      id: 'ai-chat',
      title: 'Ask the Stars',
      description: 'Have questions? Our AI astrologer is here to help interpret your chart and answer your cosmic queries.',
      targetElement: '#chat-button',
      path: '/dashboard',
    },
  ];
  
  // Return cleanup function
  return () => {
    if (guideRoot && document.body.contains(guideRoot)) {
      document.body.removeChild(guideRoot);
    }
  };
}