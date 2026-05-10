
import { useState, useEffect, useCallback } from 'react';

type AntiCheatCallback = (type: 'visibility' | 'blur') => void;

export const useAntiCheat = (onLeave: AntiCheatCallback, maxWarnings: number = 3) => {
  const [warnings, setWarnings] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      console.warn('User changed tab/window');
      onLeave('visibility');
      setWarnings(prev => prev + 1);
    }
  }, [onLeave]);

  const handleBlur = useCallback(() => {
    console.warn('User left the window (blur)');
    onLeave('blur');
    setWarnings(prev => prev + 1);
  }, [onLeave]);

  useEffect(() => {
    if (isDisqualified) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleVisibilityChange, handleBlur, isDisqualified]);

  useEffect(() => {
    if (warnings > maxWarnings && !isDisqualified) {
      setIsDisqualified(true);
      // In a real app, you might auto-submit the exam here.
      alert('Anda telah melakukan pelanggaran. Ujian akan dihentikan.');
    }
  }, [warnings, maxWarnings, isDisqualified]);

  return { warnings, isDisqualified };
};
