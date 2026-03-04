import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DecryptText } from './decrypt-text';

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
    useInView: vi.fn(() => true),
    useSpring: vi.fn(() => ({
      set: vi.fn(),
      on: vi.fn(() => vi.fn()),
    })) as unknown as typeof originalModule.useSpring,
  };
});

describe('DecryptText', () => {
  it('renders the text in an accessible sr-only span', () => {
    render(<DecryptText text="Hello World" />);
    const matches = screen.getAllByText('Hello World');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders as a span by default', () => {
    const { container } = render(<DecryptText text="Test" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe('SPAN');
  });

  it('renders as the specified element', () => {
    const { container } = render(<DecryptText text="Heading" as="h2" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.tagName).toBe('H2');
  });

  it('applies className to the wrapper element', () => {
    const { container } = render(
      <DecryptText text="Styled" className="my-class" />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('my-class');
  });

  it('renders empty string when text is empty', () => {
    const { container } = render(<DecryptText text="" />);
    expect(container.querySelector('span')?.textContent).toBe('');
  });
});
