import { useCallback, useEffect, useState } from 'react';

export const useCountdown = (targetDate) => {
  const parseTarget = (d) => (d instanceof Date ? d : new Date(d));

  const calc = useCallback(() => {
    const diff = parseTarget(targetDate).getTime() - Date.now();
    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { expired: false, days, hours, minutes, seconds };
  }, [targetDate]); // targetDate is the only real dependency

  const [left, setLeft] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setLeft(calc), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return left;
};

