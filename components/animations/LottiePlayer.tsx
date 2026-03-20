"use client";

import Lottie from "lottie-react";
import { useReducedMotion } from "framer-motion";
import type { LottieComponentProps } from "lottie-react";

interface LottiePlayerProps extends Omit<LottieComponentProps, "animationData" | "src"> {
  src: Record<string, unknown>;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
  ...props
}: LottiePlayerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Lottie
      animationData={src}
      loop={prefersReducedMotion ? false : loop}
      autoplay={prefersReducedMotion ? false : autoplay}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}
