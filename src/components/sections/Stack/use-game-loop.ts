import { useEffect, useRef } from 'react';

type OnFrame = (deltaMs: number, nowMs: number) => void;

export function useGameLoop(isActive: boolean, onFrame: OnFrame): void {
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const frameCallbackRef = useRef(onFrame);

  useEffect(() => {
    frameCallbackRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!isActive) {
      previousTimeRef.current = null;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      return;
    }

    const tick = (nowMs: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = nowMs;
      }

      const deltaMs = nowMs - previousTimeRef.current;
      previousTimeRef.current = nowMs;
      frameCallbackRef.current(deltaMs, nowMs);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      previousTimeRef.current = null;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isActive]);
}
