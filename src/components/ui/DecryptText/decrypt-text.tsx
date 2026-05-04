'use client';

import { motion, type MotionValue, useTransform } from 'framer-motion';
import { useDecryptText } from './use-decrypt-text';

interface DecryptTextProps {
  /** The text to reveal via the decrypt animation. */
  text: string;
  /** Wrapper element tag. */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  /** Character set used for scrambled glyphs. */
  charset?: string;
  /** Delay (ms) before the reveal spring starts after activation. */
  delay?: number;
  className?: string;
  /**
   * Controls when the animation plays.
   * - `boolean` — static on/off
   * - `MotionValue<boolean>` — reactive (e.g. driven by scroll progress)
   * If omitted, the animation plays immediately.
   */
  animate?: boolean | MotionValue<boolean>;
}

/**
 * Renders text with a character-by-character decrypt/scramble effect.
 *
 * Architecture:
 *  - An invisible `<span>` reserves the exact width of the final text.
 *  - A `<span>` overlay (managed by `useDecryptText`) renders the scrambled
 *    characters on top. When inactive and fully settled, this overlay is
 *    empty (no leftover glyphs).
 *  - Opacity is derived purely from the spring progress: 0 when the spring
 *    is at 0, 1 otherwise. No dual-state tracking.
 */
export function DecryptText({
  text,
  as: Tag = 'span',
  charset,
  delay = 0,
  className,
  animate = true,
}: Readonly<DecryptTextProps>) {
  const { containerRef, progress } = useDecryptText({
    text,
    animate,
    charset,
    delay,
  });

  // Opacity is purely derived from the spring position:
  // - progress > 0 → the animation is running or has content → opacity 1
  // - progress ≈ 0 → fully deactivated → opacity 0
  // The hook already clears innerHTML at progress ≈ 0, so this is a safety net.
  const opacity = useTransform(progress, (p) => (p > 0.05 ? 1 : 0));

  return (
    <Tag
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Screen reader accessible text */}
      <span className="sr-only">{text}</span>

      {/* Invisible spacer to lock the element to the exact final width */}
      <span
        aria-hidden="true"
        style={{ visibility: 'hidden', whiteSpace: 'pre' }}
      >
        {text}
      </span>

      {/* Scrambled overlay — innerHTML managed imperatively by the hook */}
      <motion.span
        aria-hidden="true"
        ref={containerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          whiteSpace: 'pre',
          opacity,
        }}
      />
    </Tag>
  );
}
