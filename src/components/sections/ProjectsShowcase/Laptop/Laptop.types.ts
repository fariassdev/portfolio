import { type MotionValue } from 'framer-motion';

export interface LaptopTransform {
  xOffset: number;
  yRotation: number;
}

export interface ScreenTransition {
  fromIndex: number;
  toIndex: number;
  blend: number;
}

export interface LaptopAnimationState {
  /** Lid hinge rotation motion value (0 = open, π/2 = closed) */
  lidRotation: MotionValue<number>;
  /** Screen content opacity based on lid position */
  screenOpacity: MotionValue<number>;
  /** Internal blend state for texture transitions */
  blendMotion: MotionValue<number>;
}

export type TransitionCallback = (fromIndex: number, toIndex: number) => void;

export interface LaptopScreenHandle {
  transitionTo: (fromIndex: number, toIndex: number) => void;
}
