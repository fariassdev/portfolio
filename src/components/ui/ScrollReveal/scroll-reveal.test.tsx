import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ScrollReveal } from './scroll-reveal';

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
    useInView: vi.fn(() => true),
  };
});

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <p>Hello world</p>
      </ScrollReveal>,
    );
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('forwards className to the wrapper', () => {
    render(
      <ScrollReveal className="custom-class">
        <p>Content</p>
      </ScrollReveal>,
    );
    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper?.className).toContain('custom-class');
  });

  it('renders as a div element', () => {
    render(
      <ScrollReveal data-testid="reveal">
        <p>Content</p>
      </ScrollReveal>,
    );
    const el = screen.getByTestId('reveal');
    expect(el.tagName).toBe('DIV');
  });
});
