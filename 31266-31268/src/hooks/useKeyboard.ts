import { useEffect, useCallback } from 'react';

interface KeyHandler {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export const useKeyboard = (handlers: KeyHandler[], enabled: boolean = true) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    for (const handler of handlers) {
      const keyMatch = e.key.toLowerCase() === handler.key.toLowerCase();
      const ctrlMatch = handler.ctrlKey === undefined || e.ctrlKey === handler.ctrlKey;
      const shiftMatch = handler.shiftKey === undefined || e.shiftKey === handler.shiftKey;
      const altMatch = handler.altKey === undefined || e.altKey === handler.altKey;
      const metaMatch = handler.metaKey === undefined || e.metaKey === handler.metaKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        if (handler.preventDefault !== false) {
          e.preventDefault();
        }
        handler.handler(e);
        break;
      }
    }
  }, [handlers, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export const parseShortcut = (shortcut: string): Omit<KeyHandler, 'handler'> => {
  const parts = shortcut.split('+').map(s => s.trim().toLowerCase());
  const key = parts.pop() || '';
  
  return {
    key,
    ctrlKey: parts.includes('ctrl'),
    shiftKey: parts.includes('shift'),
    altKey: parts.includes('alt'),
    metaKey: parts.includes('meta') || parts.includes('cmd'),
    preventDefault: true,
  };
};
