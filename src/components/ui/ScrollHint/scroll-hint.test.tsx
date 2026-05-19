import { render, screen } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import { describe, it, expect, vi } from 'vitest';
import { ScrollHint } from './scroll-hint';

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
  };
});

describe('ScrollHint Component', () => {
  it('renders the scroll text', () => {
    render(<ScrollHint />);
    expect(screen.getByText('Scroll')).toBeTruthy();
  });

  it('renders with optional motion value opacity', () => {
    const opacityValue = motionValue(1);
    const { container } = render(<ScrollHint opacity={opacityValue} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeTruthy();
  });
});
