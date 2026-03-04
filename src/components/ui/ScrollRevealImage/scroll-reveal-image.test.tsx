import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ScrollRevealImage } from './scroll-reveal-image';

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
    useInView: vi.fn(() => true),
  };
});

describe('ScrollRevealImage', () => {
  it('renders the image with correct alt text', () => {
    render(
      <ScrollRevealImage
        src="/test.png"
        alt="Test image"
        width={400}
        height={300}
      />,
    );
    expect(screen.getByAltText('Test image')).toBeTruthy();
  });

  it('renders the image with correct src', () => {
    render(
      <ScrollRevealImage
        src="/photo.jpg"
        alt="Photo"
        width={400}
        height={300}
      />,
    );
    const img = screen.getByAltText('Photo');
    expect(img.getAttribute('src')).toContain('photo.jpg');
  });

  it('applies className to the wrapper', () => {
    render(
      <ScrollRevealImage
        src="/test.png"
        alt="Test"
        width={400}
        height={300}
        className="custom"
      />,
    );
    const img = screen.getByAltText('Test');
    expect(img.parentElement?.className).toContain('custom');
  });
});
