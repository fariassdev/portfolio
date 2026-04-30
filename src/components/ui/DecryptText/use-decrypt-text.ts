'use client';

import { useReducedMotion, useSpring, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_CHARSET = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789';

interface UseDecryptTextOptions {
  readonly text: string;
  readonly isActive: boolean | MotionValue<boolean>;
  readonly charset?: string;
  readonly delay?: number;
}

/**
 * Drives a character-by-character decrypt/scramble animation.
 *
 * Returns:
 *  - `containerRef` — attach to the DOM element whose innerHTML will be updated
 *  - `isRunning`    — whether the animation is currently in motion
 *
 * The spring animates from 0 → text.length (reveal) and back to 0 (hide).
 * Characters ahead of the spring position are rendered as random glyphs;
 * characters behind it show the real value.
 */
export function useDecryptText({
  text,
  isActive,
  charset = DEFAULT_CHARSET,
  delay = 0,
}: UseDecryptTextOptions) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isActiveRef = useRef(false);

  const spring = useSpring(0, { stiffness: 30, damping: 12 });

  const content = useRef(text.split(''));
  // Keep content in sync if text changes
  useEffect(() => {
    content.current = text.split('');
  }, [text]);

  /**
   * Renders the current animation frame into the container.
   * Characters at index < position show the real value;
   * characters at index >= position show a random glyph.
   */
  const render = useCallback(
    (position: number) => {
      const el = containerRef.current;
      if (!el) return;

      const chars = content.current;
      let html = '';

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]!;
        const escaped = char
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        if (i < position) {
          // Resolved character
          html += `<span data-char="value">${escaped}</span>`;
        } else {
          // Scrambled glyph
          const glyph =
            charset[Math.floor(Math.random() * charset.length)] ?? char;
          const escapedGlyph = glyph
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          html += `<span data-char="glyph">${escapedGlyph}</span>`;
        }
      }

      el.innerHTML = html;
    },
    [charset],
  );

  /**
   * Clears the container so no scrambled text is visible.
   */
  const clear = useCallback(() => {
    const el = containerRef.current;
    if (el) el.innerHTML = '';
  }, []);

  // Main effect: subscribe to spring and isActive changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Reduced motion: show final text immediately
    if (shouldReduceMotion) {
      render(content.current.length);
      return;
    }

    // Subscribe to spring value changes → re-render characters
    const unsubSpring = spring.on('change', (value) => {
      // When fully settled at 0 and not active, clear the container
      if (value <= 0.01 && !isActiveRef.current) {
        clear();
        return;
      }
      render(value);
    });

    const activate = () => {
      isActiveRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Render initial scramble immediately so the container isn't empty
      render(0);

      timeoutRef.current = setTimeout(() => {
        spring.set(content.current.length);
      }, delay);
    };

    const deactivate = () => {
      isActiveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      spring.set(0);
    };

    // Wire up isActive (boolean or MotionValue)
    let unsubMV: (() => void) | undefined;

    if (typeof isActive === 'boolean') {
      if (isActive) activate();
      else deactivate();
    } else {
      // MotionValue<boolean>
      unsubMV = isActive.on('change', (v) => {
        if (v) activate();
        else deactivate();
      });
      // Initial state
      if (isActive.get()) activate();
      else clear();
    }

    return () => {
      unsubSpring();
      unsubMV?.();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    text,
    isActive,
    charset,
    delay,
    shouldReduceMotion,
    spring,
    render,
    clear,
  ]);

  return { containerRef, progress: spring };
}
