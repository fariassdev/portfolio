import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Stack } from './stack';

beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(function () {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
});

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: vi.fn(() => true),
  };
});

vi.mock('./stack.constants', () => ({
  categories: [
    {
      name: 'Backend',
      technologies: [
        {
          name: 'TypeScript',
          iconClassName: 'devicon-typescript-plain',
          proficiency: 'Primary',
        },
        {
          name: 'Rust',
          iconClassName: 'devicon-rust-original',
          proficiency: 'Secondary',
        },
      ],
    },
    {
      name: 'Data',
      technologies: [
        {
          name: 'PostgreSQL',
          iconClassName: 'devicon-postgresql-plain',
          proficiency: 'Primary',
        },
        {
          name: 'ClickHouse',
          iconClassName: 'devicon-clickhouse-plain',
          proficiency: 'Learning',
        },
      ],
    },
  ],
}));

describe('Stack Section', () => {
  it('renders the section title', () => {
    render(<Stack />);
    expect(
      screen.getByText('Technologies I use to build things that last.'),
    ).toBeTruthy();
  });

  it('has the correct section id for navigation', () => {
    render(<Stack />);
    const section = document.querySelector('section');
    expect(section?.id).toBe('stack');
  });

  it('renders all category names', () => {
    render(<Stack />);
    expect(screen.getByText('Backend')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
  });

  it('renders technology names', () => {
    render(<Stack />);
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('Rust')).toBeTruthy();
    expect(screen.getByText('PostgreSQL')).toBeTruthy();
    expect(screen.getByText('ClickHouse')).toBeTruthy();
  });

  it('renders proficiency badges', () => {
    render(<Stack />);
    const primaryBadges = screen.getAllByText('Primary');
    const secondaryBadges = screen.getAllByText('Secondary');
    const learningBadges = screen.getAllByText('Learning');

    expect(primaryBadges.length).toBe(2);
    expect(secondaryBadges.length).toBe(1);
    expect(learningBadges.length).toBe(1);
  });

  it('renders tech items as list items', () => {
    render(<Stack />);
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBe(2);
  });

  it('renders devicon classes for technologies', () => {
    render(<Stack />);

    expect(document.querySelector('.devicon-typescript-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-rust-original')).toBeTruthy();
    expect(document.querySelector('.devicon-postgresql-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-clickhouse-plain')).toBeTruthy();
  });
});
