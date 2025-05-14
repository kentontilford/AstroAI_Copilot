'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  value?: string;
  children?: React.ReactNode;
  autoComplete?: string;
}

/**
 * FormField component for consistent and accessible form inputs
 * Supports text inputs, textareas, selects, and custom form controls
 */
export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  description,
  className,
  onChange,
  value,
  children,
  autoComplete,
  ...props
}: FormFieldProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  
  // Common props for input elements
  const inputProps = {
    id,
    placeholder,
    disabled,
    required,
    'aria-invalid': !!error,
    'aria-describedby': cn(
      description && descriptionId,
      error && errorId
    ),
    className: cn(
      "w-full px-3 py-2 text-base text-starlight-white bg-dark-space border rounded-md transition-colors",
      "focus:outline-none focus:ring-2 focus:border-cosmic-purple",
      disabled && "opacity-60 cursor-not-allowed",
      error ? "border-red-500" : "border-nebula-veil",
      "placeholder:text-stardust-silver"
    ),
    value,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    autoComplete,
  };
  
  return (
    <div className={cn("mb-4", className)} {...props}>
      <label 
        htmlFor={id}
        className={cn(
          "block mb-1 text-sm font-medium",
          disabled ? "text-stardust-silver" : "text-nebula-veil",
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      
      {description && (
        <div 
          id={descriptionId}
          className="text-xs text-stardust-silver mb-1"
        >
          {description}
        </div>
      )}
      
      {type === 'textarea' ? (
        <textarea 
          {...inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          rows={4}
        />
      ) : type === 'select' ? (
        <select {...inputProps as React.SelectHTMLAttributes<HTMLSelectElement>}>
          {children}
        </select>
      ) : children ? (
        <div className="mt-1">{children}</div>
      ) : (
        <input 
          type={type} 
          {...inputProps as React.InputHTMLAttributes<HTMLInputElement>}
        />
      )}
      
      {error && (
        <div 
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * FormCheckbox component for accessible checkbox inputs
 */
interface FormCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormCheckbox({
  id,
  label,
  checked,
  disabled = false,
  error,
  description,
  className,
  onChange,
  ...props
}: FormCheckboxProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  
  return (
    <div className={cn("mb-4", className)} {...props}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className={cn(
              "w-4 h-4 rounded border focus:ring-2 focus:ring-cosmic-purple",
              disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              error ? "border-red-500" : "border-nebula-veil",
              "bg-dark-space"
            )}
            aria-invalid={!!error}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
          />
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor={id}
            className={cn(
              "font-medium",
              disabled ? "text-stardust-silver" : "text-nebula-veil",
              "cursor-pointer"
            )}
          >
            {label}
          </label>
          
          {description && (
            <div 
              id={descriptionId}
              className="text-xs text-stardust-silver mt-1"
            >
              {description}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div 
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </div>
      )}
    </div>
  );
}