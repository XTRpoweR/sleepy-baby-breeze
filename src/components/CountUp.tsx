import { memo, useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
}

/**
 * Animated number that counts up from 0 to `end` when it scrolls into view.
 * Uses requestAnimationFrame + IntersectionObserver for smooth, on-demand animation.
 */
const CountUp = memo(({
  end,
  duration = 1800,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
  delay = 0,
}: CountUpProps) => {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const startTime = performance.now() + delay;
            const animate = (now: number) => {
              if (now < startTime) {
                rafRef.current = requestAnimationFrame(animate);
                return;
              }
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(end * eased);
              if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
              }
            };
            rafRef.current = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, delay, hasAnimated]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
});

CountUp.displayName = "CountUp";
export default CountUp;
