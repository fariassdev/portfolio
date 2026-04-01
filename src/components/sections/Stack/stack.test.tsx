import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Stack } from './stack';

const { nextGameStatusMock, useReducedMotionMock } = vi.hoisted(() => ({
  nextGameStatusMock: vi.fn<() => 'active' | 'win' | 'lose'>(() => 'active'),
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

vi.mock('./use-game-loop', async () => {
  const { useEffect } = await import('react');

  return {
    useGameLoop: (
      isActive: boolean,
      onFrame: (deltaMs: number, nowMs: number) => void,
    ) => {
      useEffect(() => {
        if (!isActive) {
          return;
        }

        const intervalId = window.setInterval(() => {
          onFrame(16, performance.now());
        }, 16);

        return () => {
          window.clearInterval(intervalId);
        };
      }, [isActive, onFrame]);
    },
  };
});

vi.mock('./stack-game', () => ({
  GAME_WIDTH: 900,
  GAME_HEIGHT: 520,
  createInitialArkanoidState: (
    blueprints: readonly {
      id: string;
      name: string;
      errorSignature: string;
      hitMessage: string;
      durability: number;
      slot: number;
    }[],
  ) => ({
    status: 'active',
    elapsedMs: 0,
    paddle: {
      x: 450,
      y: 472,
      width: 80,
      height: 14,
    },
    ball: {
      x: 450,
      y: 420,
      vx: 140,
      vy: -260,
      size: 8,
      trail: [],
    },
    bricks: blueprints.map((blueprint) => ({
      ...blueprint,
      x: 180 + blueprint.slot * 8,
      y: 120,
      width: 220,
      height: 44,
      hitsRemaining: blueprint.durability,
      maxHits: blueprint.durability,
      destroyed: false,
      crackLevel: 0,
    })),
    flashMessage: null,
    flashTimerMs: 0,
  }),
  restartArkanoidState: (
    blueprints: readonly {
      id: string;
      name: string;
      errorSignature: string;
      hitMessage: string;
      durability: number;
      slot: number;
    }[],
  ) => ({
    status: 'active',
    elapsedMs: 0,
    paddle: {
      x: 450,
      y: 472,
      width: 80,
      height: 14,
    },
    ball: {
      x: 450,
      y: 420,
      vx: 140,
      vy: -260,
      size: 8,
      trail: [],
    },
    bricks: blueprints.map((blueprint) => ({
      ...blueprint,
      x: 180 + blueprint.slot * 8,
      y: 120,
      width: 220,
      height: 44,
      hitsRemaining: blueprint.durability,
      maxHits: blueprint.durability,
      destroyed: false,
      crackLevel: 0,
    })),
    flashMessage: null,
    flashTimerMs: 0,
  }),
  stepArkanoidState: (state: {
    elapsedMs: number;
    status: 'active' | 'lose' | 'win';
    bricks: readonly {
      destroyed: boolean;
    }[];
  }) => {
    const nextStatus = nextGameStatusMock();

    if (nextStatus === 'win') {
      return {
        ...state,
        elapsedMs: state.elapsedMs + 64,
        status: 'win',
        bricks: state.bricks.map((brick) => ({ ...brick, destroyed: true })),
      };
    }

    if (nextStatus === 'lose') {
      return {
        ...state,
        elapsedMs: state.elapsedMs + 64,
        status: 'lose',
      };
    }

    return {
      ...state,
      elapsedMs: state.elapsedMs + 16,
      status: 'active',
    };
  },
}));

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
      errorSignature: 'TS2304',
      hitMessage: 'Cannot find name "DeployConfig".',
      brickDurability: 2,
      brickSlot: 0,
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
      errorSignature: 'ERR_MODULE_NOT_FOUND',
      hitMessage:
        'Cannot find package "queue-core" imported from /app/index.mjs.',
      brickDurability: 2,
      brickSlot: 1,
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
      errorSignature: 'SQLSTATE[42P01]',
      hitMessage: 'relation "deploy_jobs" does not exist.',
      brickDurability: 2,
      brickSlot: 2,
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
      errorSignature: 'failed to solve',
      hitMessage:
        'process "/bin/sh -c npm ci" did not complete successfully: exit code: 1.',
      brickDurability: 1,
      brickSlot: 3,
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
    vi.useRealTimers();
    nextGameStatusMock.mockReset();
    nextGameStatusMock.mockReturnValue('active');
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
    expect(
      screen.getByTestId('stack-run-trigger').hasAttribute('disabled'),
    ).toBe(true);

    const nodes = screen.getAllByTestId(/stack-node-/);
    const edges = screen.getAllByTestId(/stack-edge-/);

    expect(
      nodes.every((node) => node.getAttribute('data-state') === 'static'),
    ).toBe(true);
    expect(
      edges.every((edge) => edge.getAttribute('data-state') === 'static'),
    ).toBe(true);
  });

  it('does not start gameplay while reduced motion is enabled', () => {
    render(<Stack />);

    fireEvent.click(screen.getByTestId('stack-run-trigger'));

    expect(screen.queryByTestId('stack-transition-compiling')).toBeNull();
    expect(screen.getByTestId('stack-canvas').getAttribute('data-phase')).toBe(
      'constellation',
    );
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

  it('runs compiling, breaking and deploy transitions after trigger', () => {
    vi.useFakeTimers();
    useReducedMotionMock.mockReturnValue(false);

    render(<Stack />);

    fireEvent.click(screen.getByTestId('stack-run-trigger'));

    expect(screen.getByTestId('stack-transition-compiling')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    expect(screen.getByTestId('stack-transition-breaking')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByTestId('stack-transition-deploy')).toBeTruthy();
  });

  it('renders win terminal overlay when game reports win', () => {
    vi.useFakeTimers();
    useReducedMotionMock.mockReturnValue(false);
    nextGameStatusMock.mockReturnValue('win');

    render(<Stack />);

    fireEvent.click(screen.getByTestId('stack-run-trigger'));

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('stack-win-terminal')).toBeTruthy();
  });

  it('renders lose overlay and supports Enter quick restart', () => {
    vi.useFakeTimers();
    useReducedMotionMock.mockReturnValue(false);
    nextGameStatusMock.mockReturnValue('lose');

    render(<Stack />);

    fireEvent.click(screen.getByTestId('stack-run-trigger'));

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('stack-lose-terminal')).toBeTruthy();

    nextGameStatusMock.mockReturnValue('active');
    fireEvent.keyDown(window, { key: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByTestId('stack-lose-terminal')).toBeNull();
  });

  it('renders devicon classes for technologies', () => {
    render(<Stack />);

    expect(document.querySelector('.devicon-typescript-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-nodejs-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-postgresql-plain')).toBeTruthy();
    expect(document.querySelector('.devicon-docker-plain')).toBeTruthy();
  });
});
