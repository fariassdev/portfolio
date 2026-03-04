'use client';

import { useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

const DEFAULT_CHARSET = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789';

interface UseDecryptTextOptions {
  readonly text: string;
  readonly isActive: boolean;
  readonly charset?: string;
  readonly delay?: number;
}

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
} as const;

interface CharItem {
  readonly type: (typeof CharType)[keyof typeof CharType];
  readonly value: string;
}

function shuffle(
  content: readonly string[],
  output: readonly CharItem[],
  position: number,
  charset: string,
): CharItem[] {
  return content.map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }

    if (position % 1 < 0.5) {
      const rand = Math.floor(Math.random() * charset.length);
      return { type: CharType.Glyph, value: charset[rand] ?? value };
    }

    return { type: CharType.Glyph, value: output[index]?.value ?? value };
  });
}

export function useDecryptText({
  text,
  isActive,
  charset = DEFAULT_CHARSET,
  delay = 0,
}: UseDecryptTextOptions) {
  const shouldReduceMotion = useReducedMotion();
  const outputRef = useRef<CharItem[]>([]);
  const containerRef = useRef<HTMLSpanElement>(null);
  const decoderSpring = useSpring(0, { stiffness: 8, damping: 5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const content = text.split('');

    const renderOutput = () => {
      const html = outputRef.current
        .map((item) => {
          const escaped = item.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return `<span data-char="${item.type}">${escaped}</span>`;
        })
        .join('');

      container.innerHTML = html;
    };

    if (shouldReduceMotion) {
      outputRef.current = content.map((value) => ({
        type: CharType.Value,
        value,
      }));
      renderOutput();
      return;
    }

    const unsubscribe = decoderSpring.on('change', (value) => {
      outputRef.current = shuffle(content, outputRef.current, value, charset);
      renderOutput();
    });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isActive) {
      timeoutId = setTimeout(() => {
        decoderSpring.set(content.length);
      }, delay);
    }

    return () => {
      unsubscribe();
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [text, isActive, charset, delay, shouldReduceMotion, decoderSpring]);

  return { containerRef };
}
