'use client';

import {
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
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

  // Pre-smoothed, phase-snapped motion values
  heroProgress: MotionValue<number>;
  projectsProgress: MotionValue<number>;
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

  // 2. Track Hero Scroll independently
  const { scrollYProgress: heroRawScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Snappy but perfectly smoothed spring configuration for Hero zoom-through
  const heroProgressSpring = useSpring(heroRawScroll, {
    stiffness: 250,
    damping: 35,
    mass: 0.5,
    restDelta: 0.0001,
  });
  const heroProgress = useTransform(heroProgressSpring, (value) =>
    clamp(value, 0, 1),
  );

  // 3. Track Projects Scroll independently
  const { scrollYProgress: projectsRawScroll } = useScroll({
    target: projectsRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring configuration for projects slides (perfectly smooth, linear scrolling)
  const projectsProgressSpring = useSpring(projectsRawScroll, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
    restDelta: 0.0001,
  });
  const projectsProgress = useTransform(projectsProgressSpring, (value) =>
    clamp(value, 0, 1),
  );

  const contextValue = useMemo(
    () => ({
      heroRef,
      projectsRef,
      heroProgress,
      projectsProgress,
    }),
    [heroRef, projectsRef, heroProgress, projectsProgress],
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
