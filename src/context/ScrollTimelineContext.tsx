'use client';

import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  createContext,
  useContext,
  useRef,
  useMemo,
  type ReactNode,
  type RefObject,
} from 'react';
import { clamp } from '@/helpers/math.helpers';

interface ScrollTimelineContextType {
  // Element references managed by the coordinator
  heroRef: RefObject<HTMLElement | null>;
  projectsRef: RefObject<HTMLDivElement | null>;
  aboutRef: RefObject<HTMLDivElement | null>;

  // Pre-smoothed, phase-snapped motion values
  heroProgress: MotionValue<number>;
  projectsProgress: MotionValue<number>;
  aboutProgress: MotionValue<number>;
}

const ScrollTimelineContext = createContext<ScrollTimelineContextType | null>(
  null,
);

interface ScrollTimelineProviderProps {
  children: ReactNode;
}

export function ScrollTimelineProvider({
  children,
}: ScrollTimelineProviderProps) {
  // 1. Instantiating DOM element references
  const heroRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // 2. Track Hero Scroll independently
  const { scrollYProgress: heroRawScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Since Lenis already smooths scrolling, we don't need useSpring over useScroll anymore
  const heroProgress = useTransform(heroRawScroll, (value) =>
    clamp(value, 0, 1),
  );

  // 3. Track Projects Scroll independently
  const { scrollYProgress: projectsRawScroll } = useScroll({
    target: projectsRef,
    offset: ['start start', 'end end'],
  });

  // Since Lenis already smooths scrolling, we don't need useSpring over useScroll anymore
  const projectsProgress = useTransform(projectsRawScroll, (value) =>
    clamp(value, 0, 1),
  );

  // 4. Track About Scroll independently
  const { scrollYProgress: aboutRawScroll } = useScroll({
    target: aboutRef,
    offset: ['start start', 'end end'],
  });

  // Since Lenis already smooths scrolling, we don't need useSpring over useScroll anymore
  const aboutProgress = useTransform(aboutRawScroll, (value) =>
    clamp(value, 0, 1),
  );

  const contextValue = useMemo(
    () => ({
      heroRef,
      projectsRef,
      aboutRef,
      heroProgress,
      projectsProgress,
      aboutProgress,
    }),
    [
      heroRef,
      projectsRef,
      aboutRef,
      heroProgress,
      projectsProgress,
      aboutProgress,
    ],
  );

  return (
    <ScrollTimelineContext.Provider value={contextValue}>
      {children}
    </ScrollTimelineContext.Provider>
  );
}

export function useScrollTimeline() {
  const context = useContext(ScrollTimelineContext);
  if (!context) {
    throw new Error(
      'useScrollTimeline must be used within a ScrollTimelineProvider',
    );
  }
  return context;
}
