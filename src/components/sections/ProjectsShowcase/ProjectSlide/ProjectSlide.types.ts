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
  /** Mobile entrance opacity (0 to 1) */
  mobileEntranceOpacity: MotionValue<number>;
  /** Whether the text animations (sweep and decrypt) should be triggered */
  shouldAnimateText: MotionValue<boolean>;
  /** Content fade in/out opacity */
  contentOpacity: MotionValue<number>;
}
