import { describe, expect, it } from 'vitest';
import { getProjectSlideState } from './projects.constants';

describe('getProjectSlideState', () => {
  it('computes phase values for first project', () => {
    const stateAtRevealStart = getProjectSlideState(0.2, 0);
    expect(stateAtRevealStart.reveal).toBe(0);
    expect(stateAtRevealStart.blur).toBe(0);
    expect(stateAtRevealStart.active).toBe(true);

    const stateMidTransition = getProjectSlideState(0.5, 0);
    expect(stateMidTransition.reveal).toBe(1);
    expect(stateMidTransition.blur).toBeCloseTo(0.5, 6);
    expect(stateMidTransition.active).toBe(true);

    const stateAfterFirstProject = getProjectSlideState(0.61, 0);
    expect(stateAfterFirstProject.active).toBe(false);
  });

  it('computes phase values for second project', () => {
    const stateBeforeReveal = getProjectSlideState(0.59, 1);
    expect(stateBeforeReveal.reveal).toBe(0);
    expect(stateBeforeReveal.active).toBe(true);

    const stateAtRevealEnd = getProjectSlideState(0.8, 1);
    expect(stateAtRevealEnd.reveal).toBe(1);
    expect(stateAtRevealEnd.blur).toBe(0);
    expect(stateAtRevealEnd.active).toBe(true);
  });

  it('returns hidden default for unsupported indexes', () => {
    const state = getProjectSlideState(0.7, 999);
    expect(state.reveal).toBe(0);
    expect(state.blur).toBe(0);
    expect(state.active).toBe(false);
  });
});
