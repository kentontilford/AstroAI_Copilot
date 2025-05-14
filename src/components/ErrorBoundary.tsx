'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { errorLogger } from '@/lib/errors/logger';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component error boundary to catch rendering errors
 * and display a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger(error, { 
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary' 
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 my-4">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="mb-4 text-sm text-red-800 dark:text-red-300">
            We apologize for the inconvenience. Please try refreshing the component.
          </p>
          
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
              {this.state.error.message}
            </div>
          )}
          
          <Button 
            onClick={this.handleReset}
            variant="outline" 
            size="sm"
            className="text-red-800 hover:text-red-900 border-red-300 dark:text-red-300 dark:hover:text-red-200 dark:border-red-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A HOC that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}