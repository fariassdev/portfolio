'use client';

import {
  useInView,
  useReducedMotion,
  type UseInViewOptions,
} from 'framer-motion';
import { useRef } from 'react';

interface UseScrollRevealOptions {
  readonly once?: boolean;
  readonly margin?: UseInViewOptions['margin'];
  readonly amount?: number;
}

export function useScrollReveal({
  once = true,
  margin = '-64px',
  amount = 0.3,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin, amount });
  const shouldReduceMotion = useReducedMotion();

  return {
    ref,
    isInView: shouldReduceMotion ? true : isInView,
    shouldReduceMotion,
  };
}
