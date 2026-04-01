import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Stack } from './stack';

const { useReducedMotionMock } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn(() => true),
}));

beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(function () {
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
});

vi.mock(import('framer-motion'), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useReducedMotion: useReducedMotionMock,
  };
});

vi.mock('./stack.constants', () => ({
  clusterLabels: [
    { cluster: 'backend', x: 16, y: 12 },
    { cluster: 'data', x: 62, y: 24 },
    { cluster: 'infrastructure', x: 28, y: 66 },
  ],
  clusterNames: {
    backend: 'Backend',
    data: 'Data',
    infrastructure: 'Infrastructure',
  },
  techNodes: [
    {
      id: 'typescript',
      name: 'TypeScript',
      iconClassName: 'devicon-typescript-plain',
      cluster: 'backend',
      proficiency: 'Primary',
      x: 16,
      y: 20,
      floatRangeX: 1,
      floatRangeY: 1,
      floatSpeed: 1,
      floatPhase: 0.2,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      iconClassName: 'devicon-nodejs-plain',
      cluster: 'backend',
      proficiency: 'Primary',
      x: 29,
      y: 29,
      floatRangeX: 1,
      floatRangeY: 1,
      floatSpeed: 1,
      floatPhase: 0.5,
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      iconClassName: 'devicon-postgresql-plain',
      cluster: 'data',
      proficiency: 'Primary',
      x: 62,
      y: 39,
      floatRangeX: 1,
      floatRangeY: 1,
      floatSpeed: 1,
      floatPhase: 0.8,
    },
    {
      id: 'docker',
      name: 'Docker',
      iconClassName: 'devicon-docker-plain',
      cluster: 'infrastructure',
      proficiency: 'Secondary',
      x: 36,
      y: 72,
      floatRangeX: 1,
      floatRangeY: 1,
      floatSpeed: 1,
      floatPhase: 1.2,
    },
  ],
  techEdges: [
    ['typescript', 'nodejs'],
    ['nodejs', 'postgresql'],
    ['postgresql', 'docker'],
  ],
}));

describe('Stack Section', () => {
  beforeEach(() => {
    useReducedMotionMock.mockReset();
    useReducedMotionMock.mockReturnValue(true);
  });

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

  it('renders technology nodes and connection lines', () => {
    render(<Stack />);
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('Node.js')).toBeTruthy();
    expect(screen.getByText('PostgreSQL')).toBeTruthy();
    expect(screen.getByText('Docker')).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBe(4);
    expect(screen.getAllByTestId(/stack-edge-/).length).toBe(3);
  });

  it('renders static constellation states when reduced motion is enabled', () => {
    render(<Stack />);

    expect(screen.queryByRole('button', { name: /TypeScript/i })).toBeNull();

    const nodes = screen.getAllByTestId(/stack-node-/);
    const edges = screen.getAllByTestId(/stack-edge-/);

    expect(
      nodes.every((node) => node.getAttribute('data-state') === 'static'),
    ).toBe(true);
    expect(
      edges.every((edge) => edge.getAttribute('data-state') === 'static'),
    ).toBe(true);
  });

  it('highlights connected nodes and edges when motion is enabled', () => {
    useReducedMotionMock.mockReturnValue(false);
    render(<Stack />);

    const nodeButton = screen.getByRole('button', {
      name: 'Node.js (Backend)',
    });

    fireEvent.mouseEnter(nodeButton);

    expect(
      screen.getByTestId('stack-node-nodejs').getAttribute('data-state'),
    ).toBe('active');
    expect(
      screen.getByTestId('stack-node-postgresql').getAttribute('data-state'),
    ).toBe('connected');
    expect(
      screen.getByTestId('stack-node-docker').getAttribute('data-state'),
    ).toBe('muted');
    expect(
      screen
        .getByTestId('stack-edge-nodejs-postgresql')
        .getAttribute('data-state'),
    ).toBe('active');
    expect(
      screen
        .getByTestId('stack-edge-postgresql-docker')
        .getAttribute('data-state'),
    ).toBe('muted');

    fireEvent.mouseLeave(nodeButton);

    expect(
      screen.getByTestId('stack-node-nodejs').getAttribute('data-state'),
    ).toBe('idle');
    expect(
      screen
        .getByTestId('stack-edge-nodejs-postgresql')
        .getAttribute('data-state'),
    ).toBe('idle');
  });

  it('renders devicon classes for technologies', () => {
    render(<Stack />);

    expect(document.querySelector('.devicon-typescript-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-nodejs-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-postgresql-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-docker-plain')).toBeTruthy();
  });
});
