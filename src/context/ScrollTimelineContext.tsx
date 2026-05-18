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
import {
  SCROLL_PAGES,
  PHASE_LENGTH,
} from '@/components/sections/ProjectsShowcase/ProjectsShowcase.constants';

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
  const heroProgress = useSpring(heroRawScroll, {
    stiffness: 250,
    damping: 35,
    mass: 0.5,
    restDelta: 0.0001,
  });

  // 3. Track Projects Scroll independently
  const { scrollYProgress: projectsRawScroll } = useScroll({
    target: projectsRef,
    offset: ['start start', 'end end'],
  });

  // Snapping logic for project slider animation phases
  const projectsSnappedProgress = useTransform(
    projectsRawScroll,
    (progress) => {
      if (progress <= 0) return 0;
      if (progress >= 1) return 1;

      const scrollPages = SCROLL_PAGES;
      const phaseLength = PHASE_LENGTH;

      // Do not snap during the title and laptop entrance phases (Phase 0 and 1) to ensure ultra-smooth, progressive scrolling
      if (progress < 2 * phaseLength) return progress;
      if (progress > 1 - phaseLength) return progress;

      const phase = Math.round(progress * scrollPages);
      return phase / scrollPages;
    },
  );

  // Smooth snapping spring configuration for projects slides
  const projectsProgress = useSpring(projectsSnappedProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.8,
    restDelta: 0.0001,
  });

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
