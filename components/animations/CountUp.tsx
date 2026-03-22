"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  target: number;
  suffix?: string;
}

export const CountUp = ({ target, suffix = "" }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 3000;
    const startTime = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};
