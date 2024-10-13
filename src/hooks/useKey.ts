import { useEffect } from 'react';

export const useKey = (key: string, action: () => void) => {
  useEffect(() => {
    const handlePressKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        action();
      }
    };

    document.addEventListener('keydown', handlePressKey);

    return () => {
      document.removeEventListener('keydown', handlePressKey);
    };
  }, [action, key]);
};
