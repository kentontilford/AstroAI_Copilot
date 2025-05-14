'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="fixed bottom-0 right-0 p-4 z-50 flex flex-col space-y-2 max-w-md w-full sm:w-auto"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // Type-based styling and icons
  const typeClasses = {
    success: 'bg-green-600 border-green-400',
    error: 'bg-red-600 border-red-400',
    warning: 'bg-yellow-600 border-yellow-400',
    info: 'bg-cosmic-purple border-supernova-teal',
  };
  
  // Type-based accessibility roles
  const typeRoles = {
    error: 'alert',
    success: 'status',
    warning: 'alert',
    info: 'status',
  };
  
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 text-starlight-white shadow-lg max-w-md w-full',
        'animate-in slide-in-from-right-full duration-300',
        'flex justify-between items-start',
        typeClasses[toast.type]
      )}
      role={typeRoles[toast.type]}
    >
      <div className="flex-grow mr-2">{toast.message}</div>
      <button
        onClick={onClose}
        className="text-stardust-silver hover:text-starlight-white rounded-full p-1"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

// Utility function to create toast notifications outside of React components
let toastFunction: ToastContextType['addToast'] | null = null;

export function setToastFunction(fn: ToastContextType['addToast']) {
  toastFunction = fn;
}

export const toast = {
  show: (message: string, type?: ToastType, duration?: number) => {
    if (toastFunction) {
      return toastFunction(message, type, duration);
    }
    console.warn('Toast function not set. Wrap your app with ToastProvider.');
    return '';
  },
  success: (message: string, duration?: number) => {
    return toast.show(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    return toast.show(message, 'error', duration);
  },
  warning: (message: string, duration?: number) => {
    return toast.show(message, 'warning', duration);
  },
  info: (message: string, duration?: number) => {
    return toast.show(message, 'info', duration);
  },
};