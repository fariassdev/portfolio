import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hero } from './hero';
import { HERO_NAME, HERO_TITLE, ROLES } from './hero.constants';

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
  };
});

describe('Hero Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the developer name', () => {
    render(<Hero />);
    expect(screen.getByText(HERO_NAME)).toBeTruthy();
  });

  it('renders the heading with static role title', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain(HERO_TITLE);
  });

  it('renders the first rotating role when reduced motion is preferred', () => {
    render(<Hero />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const roleLive = screen.getByText(
      new RegExp(String.raw`${HERO_TITLE}\s*&\s*${ROLES[0]}`),
    );
    expect(roleLive).toBeTruthy();
  });

  it('renders "Explore Work" link with correct href', () => {
    render(<Hero />);

    const exploreLink = screen.getByRole('link', { name: /Explore Work/i });
    expect(exploreLink).toBeTruthy();
    expect(exploreLink.getAttribute('href')).toBe('#work');
  });

  it('renders "Resume" download link', () => {
    render(<Hero />);
    const resumeLink = screen.getByRole('link', { name: /View Resume/i });
    expect(resumeLink).toBeTruthy();
    expect(resumeLink.getAttribute('href')).toBe('/cv.pdf');
    expect(resumeLink.hasAttribute('download')).toBe(true);
  });

  it('renders the scroll indicator', () => {
    render(<Hero />);
    expect(screen.getByText('Scroll')).toBeTruthy();
  });
});
