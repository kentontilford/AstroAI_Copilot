import { useEffect, useCallback, useState } from 'react';

type KeyboardAction = {
  key: string | string[];
  callback: (e: KeyboardEvent) => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  element?: HTMLElement | null;
};

/**
 * Custom hook for handling keyboard shortcuts across the application
 * @param actions Array of keyboard actions with keys and callbacks
 */
export function useKeyboard(actions: KeyboardAction[]) {
  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const action of actions) {
        const { key, callback, ctrlKey, altKey, shiftKey, metaKey, preventDefault, element } = action;
        
        // Skip if the action is tied to a specific element and that element doesn't have focus
        if (element && document.activeElement !== element) continue;
        
        // Check if the pressed key matches any of the specified keys
        const keys = Array.isArray(key) ? key : [key];
        const keyMatch = keys.some(k => e.key === k || e.code === k);
        
        if (
          keyMatch &&
          (ctrlKey === undefined || e.ctrlKey === ctrlKey) &&
          (altKey === undefined || e.altKey === altKey) &&
          (shiftKey === undefined || e.shiftKey === shiftKey) &&
          (metaKey === undefined || e.metaKey === metaKey)
        ) {
          if (preventDefault !== false) {
            e.preventDefault();
          }
          callback(e);
          return;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}

/**
 * Hook to detect specific keyboard combinations
 * @param keyCombo Keyboard shortcut to detect (e.g., 'Control+S')
 * @returns Whether the key combination is currently pressed
 */
export function useKeyCombo(keyCombo: string) {
  const [isPressed, setIsPressed] = useState(false);
  
  useEffect(() => {
    // Parse the key combination
    const parts = keyCombo.split('+').map(part => part.trim().toLowerCase());
    const key = parts.filter(
      part => !['control', 'ctrl', 'alt', 'shift', 'meta', 'command'].includes(part)
    )[0];
    const ctrlKey = parts.some(part => part === 'control' || part === 'ctrl');
    const altKey = parts.some(part => part === 'alt');
    const shiftKey = parts.some(part => part === 'shift');
    const metaKey = parts.some(part => part === 'meta' || part === 'command');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key.toLowerCase() === key || e.code.toLowerCase() === key) &&
        e.ctrlKey === ctrlKey &&
        e.altKey === altKey &&
        e.shiftKey === shiftKey &&
        e.metaKey === metaKey
      ) {
        setIsPressed(true);
      }
    };
    
    const handleKeyUp = () => {
      setIsPressed(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyCombo]);
  
  return isPressed;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
}

/**
 * Hook to set up keyboard shortcuts for a specific component
 * @param shortcuts Array of shortcut definitions
 */
export function useShortcuts(shortcuts: KeyboardShortcut[]) {
  // Convert to the format expected by useKeyboard
  const keyboardActions = shortcuts.map(shortcut => ({
    key: shortcut.key,
    callback: () => shortcut.action(),
    ctrlKey: shortcut.modifiers?.ctrl,
    altKey: shortcut.modifiers?.alt,
    shiftKey: shortcut.modifiers?.shift,
    metaKey: shortcut.modifiers?.meta,
    preventDefault: true,
  }));
  
  useKeyboard(keyboardActions);
  
  // Return shortcut help information for UI components
  return shortcuts.map(({ key, description, modifiers }) => {
    const parts = [];
    if (modifiers?.ctrl) parts.push('Ctrl');
    if (modifiers?.alt) parts.push('Alt');
    if (modifiers?.shift) parts.push('Shift');
    if (modifiers?.meta) parts.push('⌘');
    parts.push(key.toUpperCase());
    
    return {
      key: parts.join('+'),
      description,
    };
  });
}

/**
 * Hook to create a key handler for specific components like inputs or textareas
 * @param inputRef Ref to the input element
 * @param handlers Object mapping keys to handler functions
 */
export function useInputKeyboard<T extends HTMLElement>(
  inputRef: React.RefObject<T>,
  handlers: Record<string, (e: React.KeyboardEvent) => void>
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const handler = handlers[e.key];
      if (handler) {
        handler(e);
      }
    },
    [handlers]
  );
  
  return { handleKeyDown };
}