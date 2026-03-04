'use client';

import { useScrollReveal } from '@/hooks/use-scroll-reveal';

import { useDecryptText } from './use-decrypt-text';

interface DecryptTextProps {
  readonly text: string;
  readonly as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  readonly charset?: string;
  readonly delay?: number;
  readonly className?: string;
}

export function DecryptText({
  text,
  as: Tag = 'span',
  charset,
  delay = 0,
  className,
}: DecryptTextProps) {
  const { ref, isInView } = useScrollReveal();
  const { containerRef } = useDecryptText({
    text,
    isActive: isInView,
    charset,
    delay,
  });

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="sr-only">{text}</span>
      {/* Invisible text locks the element to the exact width of the original */}
      <span
        aria-hidden="true"
        style={{ visibility: 'hidden', whiteSpace: 'pre' }}
      >
        {text}
      </span>
      {/* Scrambled overlay is clipped to that width */}
      <span
        aria-hidden="true"
        ref={containerRef}
        style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}
      />
    </Tag>
  );
}
