'use client';

import React from 'react';
import { ToastProvider, setToastFunction, useToast } from '@/components/ui/toast';

/**
 * Client providers component to wrap the application with various context providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ToastInitializer>
        {children}
      </ToastInitializer>
    </ToastProvider>
  );
}

/**
 * Helper component to initialize the toast function
 * This allows using toast outside of React components
 */
function ToastInitializer({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  
  React.useEffect(() => {
    setToastFunction(addToast);
    return () => setToastFunction(() => '');
  }, [addToast]);
  
  return <>{children}</>;
}