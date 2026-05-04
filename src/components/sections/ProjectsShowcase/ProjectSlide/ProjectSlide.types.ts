import { type MotionValue } from 'framer-motion';

export interface ProjectSlideState {
  reveal: number;
  blur: number;
  active: boolean;
}

/**
 * Animation state for a single project slide.
 * Consolidates all slide-related motion values into a single object.
 */
export interface SlideAnimationState {
  /** CSS clip-path for masking the slide content */
  clipPath: MotionValue<string>;
  /** Visibility state (visible/hidden) */
  visibility: MotionValue<'visible' | 'hidden'>;
  /** Mobile entrance Y offset in pixels */
  mobileEntranceY: MotionValue<number>;
  /** Mobile entrance opacity (0 to 1) */
  mobileEntranceOpacity: MotionValue<number>;
  /** Text sweep reveal progress (0 to 1) */
  sweepReveal: MotionValue<number>;
  /** Whether the decrypt label animation should be active */
  isLabelActive: MotionValue<boolean>;
  /** Content fade in/out opacity */
  contentOpacity: MotionValue<number>;
  /** Content Y position with reveal and blur transforms */
  contentY: MotionValue<number>;
}
