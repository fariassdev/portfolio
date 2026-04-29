import { clamp, easeInOut, lerp } from '@/helpers/math.helpers';
import {
  CLIP_PATH_CENTER,
  CLIP_PATH_TILT_FACTOR,
  CLIP_PATH_WIDTH,
  MAX_LAPTOP_ROTATION_Y,
  PHASE_LENGTH,
  PROJECT_COUNT,
} from './ProjectsShowcase.constants';
import type {
  LaptopTransform,
  ProjectSlideState,
  ScreenTransition,
} from './ProjectsShowcase.types';

/**
 * Calculates the length of a single animation phase.
 */
export function getPhaseLength(projectCount: number): number {
  return 1 / (projectCount > 0 ? projectCount * 2 + 3 : 1);
}

/**
 * Calculates the laptop's position and rotation based on scroll progress.
 */
export function getLaptopTransform(
  progress: number,
  projectCount: number,
  maxSlide: number,
): LaptopTransform {
  const phaseLen = getPhaseLength(projectCount);
  if (projectCount <= 0 || progress < phaseLen || progress > 1 - phaseLen) {
    return { xOffset: 0, yRotation: 0 };
  }

  // Calculate active index based on current progress
  let activeIndex = Math.floor((progress - phaseLen) / (phaseLen * 2));
  activeIndex = clamp(activeIndex, 0, projectCount - 1);

  const isEven = activeIndex % 2 === 0;
  const targetX = isEven ? -maxSlide : maxSlide;
  const targetRotation = isEven
    ? MAX_LAPTOP_ROTATION_Y
    : -MAX_LAPTOP_ROTATION_Y;
  const oppositeX = isEven ? maxSlide : -maxSlide;
  const oppositeRotation = isEven
    ? -MAX_LAPTOP_ROTATION_Y
    : MAX_LAPTOP_ROTATION_Y;

  const projectStartPhase = phaseLen + activeIndex * phaseLen * 2;
  const transitionInProgress = clamp(
    (progress - projectStartPhase) / phaseLen,
    0,
    1,
  );

  // Final project "out" transition
  if (
    activeIndex === projectCount - 1 &&
    progress >= projectStartPhase + 2 * phaseLen
  ) {
    const transitionOutProgress = clamp(
      (progress - (projectStartPhase + 2 * phaseLen)) / phaseLen,
      0,
      1,
    );
    const eased = easeInOut(transitionOutProgress);
    return {
      xOffset: lerp(targetX, 0, eased),
      yRotation: lerp(targetRotation, 0, eased),
    };
  }

  // First project initial sweep in
  if (activeIndex === 0 && transitionInProgress < 1) {
    const eased = easeInOut(transitionInProgress);
    return {
      xOffset: lerp(0, targetX, eased),
      yRotation: lerp(0, targetRotation, eased),
    };
  }

  // Intermediate transitions between projects
  if (transitionInProgress < 1) {
    const eased = easeInOut(transitionInProgress);
    return {
      xOffset: lerp(oppositeX, targetX, eased),
      yRotation: lerp(oppositeRotation, targetRotation, eased),
    };
  }

  // Steady viewing state
  return {
    xOffset: targetX,
    yRotation: targetRotation,
  };
}

/**
 * Calculates the screen content transition state.
 */
export function getScreenTransition(
  progress: number,
  projectCount: number,
  textureCount: number,
): ScreenTransition {
  const phaseLen = getPhaseLength(projectCount);
  if (textureCount <= 0) {
    return { fromIndex: 0, toIndex: 0, blend: 0 };
  }

  // Keep first project visible until the first horizontal sweep.
  const transitionZoneStart = phaseLen * 3;

  if (projectCount <= 1 || progress < transitionZoneStart) {
    return {
      fromIndex: 0,
      toIndex: 0,
      blend: 0,
    };
  }

  const transitionsCount = projectCount - 1;
  let activeTransition = Math.floor(
    (progress - transitionZoneStart) / (phaseLen * 2),
  );
  activeTransition = clamp(activeTransition, 0, transitionsCount - 1);

  const transitionStart = transitionZoneStart + activeTransition * phaseLen * 2;
  const transitionProgress = clamp(
    (progress - transitionStart) / phaseLen,
    0,
    1,
  );

  return {
    fromIndex: clamp(activeTransition, 0, textureCount - 1),
    toIndex: clamp(activeTransition + 1, 0, textureCount - 1),
    blend: easeInOut(transitionProgress),
  };
}

/**
 * Generates the CSS clip-path for the project slides.
 */
export function getSlideClipPath(laptopX: number, side: 'left' | 'right') {
  const xPercent = CLIP_PATH_CENTER + laptopX;
  const tilt = (laptopX / 25) * CLIP_PATH_TILT_FACTOR;

  if (side === 'right') {
    const edge = xPercent + CLIP_PATH_WIDTH / 2;
    const base = ((edge - 55) / 45) * 100;
    const x1 = base + tilt;
    const x2 = base - tilt;
    return `polygon(${x1}% -20%, 120% -20%, 120% 120%, ${x2}% 120%)`;
  }

  const edge = xPercent - CLIP_PATH_WIDTH / 2;
  const base = ((45 - edge) / 45) * 100;
  const x1 = 100 - base - tilt;
  const x2 = 100 - base + tilt;
  return `polygon(-20% -20%, ${x1}% -20%, ${x2}% 120%, -20% 120%)`;
}

/**
 * Calculates the state of an individual project slide (reveal, blur, active).
 */
export function getProjectSlideState(
  progress: number,
  index: number,
): ProjectSlideState {
  if (PROJECT_COUNT === 0) return { reveal: 0, blur: 0, active: false };

  const revealStart = (2 * index + 1) * PHASE_LENGTH;
  const blurStart = revealStart + 2 * PHASE_LENGTH;

  const activeStart = revealStart;
  const activeEnd = blurStart + PHASE_LENGTH;

  return {
    reveal: clamp((progress - revealStart) / PHASE_LENGTH, 0, 1),
    blur: clamp((progress - blurStart) / PHASE_LENGTH, 0, 1),
    active: progress >= activeStart && progress <= activeEnd,
  };
}
