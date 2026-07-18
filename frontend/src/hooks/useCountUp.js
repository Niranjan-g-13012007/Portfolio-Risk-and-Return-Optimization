import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 -> target over `duration` ms.
 * Used for KPI cards and hero stats so figures feel alive rather than static.
 */
export function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    if (typeof target !== "number" || Number.isNaN(target)) return;
    startRef.current = null;

    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((target * eased).toFixed(decimals)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);

  return value;
}
