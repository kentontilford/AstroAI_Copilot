'use client';

import React, { useState } from 'react';
import { useKeyboard } from '@/lib/hooks/use-keyboard';
import { cn } from '@/lib/utils';
import { ModalContainer } from './focus-trap';

interface ShortcutItem {
  key: string;
  description: string;
  category?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutItem[];
  triggerClassName?: string;
  modalTitle?: string;
}

/**
 * KeyboardShortcuts component displays available keyboard shortcuts
 * Shows a help modal with categorized shortcuts
 */
export function KeyboardShortcuts({
  shortcuts,
  triggerClassName,
  modalTitle = 'Keyboard Shortcuts',
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key to open the shortcuts modal
  useKeyboard([
    {
      key: ['?', 'shift+?'],
      callback: () => setIsOpen(true),
    },
  ]);

  // Group shortcuts by category
  const categorizedShortcuts = shortcuts.reduce<Record<string, ShortcutItem[]>>(
    (acc, shortcut) => {
      const category = shortcut.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {}
  );

  return (
    <>
      <button
        className={cn(
          'p-2 text-nebula-veil hover:text-starlight-white',
          triggerClassName
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Show keyboard shortcuts"
        title="Keyboard Shortcuts"
      >
        <kbd className="p-1 border border-nebula-veil/20 rounded text-xs bg-dark-space">
          ?
        </kbd>
      </button>

      <ModalContainer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title={modalTitle}
        contentClassName="max-w-2xl"
      >
        <div className="text-stardust-silver mb-4">
          Press <kbd className="px-1 py-0.5 border border-nebula-veil/20 rounded text-xs bg-dark-space">?</kbd> anywhere to open this dialog
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="shortcut-category">
              <h3 className="text-lg font-medium text-starlight-white mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-nebula-veil">{shortcut.description}</span>
                    <ShortcutKey keys={shortcut.key} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-cosmic-purple text-starlight-white rounded-md hover:bg-cosmic-purple/90"
          >
            Close
          </button>
        </div>
      </ModalContainer>
    </>
  );
}

/**
 * Component to display shortcut key combinations
 */
export function ShortcutKey({ keys }: { keys: string }) {
  // Split combination keys like 'Ctrl+S' into individual parts
  const keyParts = keys.split('+');

  return (
    <div className="flex items-center space-x-1">
      {keyParts.map((part, index) => (
        <React.Fragment key={index}>
          <kbd
            className="min-w-[1.75rem] h-7 flex items-center justify-center px-1.5 bg-dark-space border border-nebula-veil/20 rounded text-xs font-medium text-starlight-white"
          >
            {part}
          </kbd>
          {index < keyParts.length - 1 && <span className="text-stardust-silver">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Default application shortcuts that can be used throughout the app
 */
export function useAppShortcuts() {
  return [
    { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
    { key: 'Esc', description: 'Close dialogs', category: 'General' },
    { key: 'Tab', description: 'Navigate focus', category: 'General' },
    { key: 'Shift+Tab', description: 'Navigate focus (reverse)', category: 'General' },
    { key: '/', description: 'Search', category: 'General' },
    { key: 'Ctrl+S', description: 'Save changes', category: 'Actions' },
    { key: 'N', description: 'New chart', category: 'Navigation' },
    { key: 'D', description: 'Go to dashboard', category: 'Navigation' },
    { key: 'C', description: 'Go to chat', category: 'Navigation' },
    { key: 'S', description: 'Go to settings', category: 'Navigation' },
  ];
}