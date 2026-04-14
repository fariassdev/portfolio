import { describe, expect, it } from 'vitest';

import type { BrickBlueprint } from './stack-game';
import {
  createInitialArkanoidState,
  GAME_HEIGHT,
  getBallSpeed,
  getRemainingBricks,
  restartArkanoidState,
  stepArkanoidState,
} from './stack-game';

const testBlueprints: readonly BrickBlueprint[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    errorSignature: 'TS2304',
    hitMessage: 'Cannot find name "DeployConfig".',
    durability: 2,
    slot: 0,
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    errorSignature: 'GRAPHQL_VALIDATION_FAILED',
    hitMessage: 'Unknown type "DeployStatus" in schema.graphql.',
    durability: 1,
    slot: 1,
  },
] as const;

function placeBallForTopHit(
  state: ReturnType<typeof createInitialArkanoidState>,
  brickId: BrickBlueprint['id'],
) {
  const targetBrick = state.bricks.find((brick) => brick.id === brickId);

  if (!targetBrick) {
    throw new Error(`Missing brick ${brickId}`);
  }

  return {
    ...state,
    ball: {
      ...state.ball,
      x: targetBrick.x,
      y: targetBrick.y - targetBrick.height / 2 - state.ball.size / 2 - 0.5,
      vx: 0,
      vy: 220,
      trail: [],
    },
  };
}

describe('stack-game', () => {
  it('builds an initial active game state with mapped bricks', () => {
    const state = createInitialArkanoidState(testBlueprints);

    expect(state.status).toBe('active');
    expect(state.bricks.length).toBe(2);
    expect(state.bricks[0]?.hitsRemaining).toBe(2);
    expect(state.bricks[1]?.hitsRemaining).toBe(1);
    expect(getRemainingBricks(state.bricks)).toBe(2);
  });

  it('applies durability correctly for secondary bricks in one hit', () => {
    const state = createInitialArkanoidState(testBlueprints);
    const positioned = placeBallForTopHit(state, 'graphql');

    const stepped = stepArkanoidState(
      positioned,
      { moveDirection: 0, pointerX: null },
      16,
    );

    const graphqlBrick = stepped.bricks.find((brick) => brick.id === 'graphql');
    expect(graphqlBrick?.destroyed).toBe(true);
    expect(graphqlBrick?.hitsRemaining).toBe(0);
    expect(stepped.flashMessage).toBe(
      'Unknown type "DeployStatus" in schema.graphql.',
    );
  });

  it('requires two hits for primary bricks and boosts speed on destruction', () => {
    const state = createInitialArkanoidState(testBlueprints);

    const firstHitState = stepArkanoidState(
      placeBallForTopHit(state, 'typescript'),
      { moveDirection: 0, pointerX: null },
      16,
    );

    const afterFirstHit = firstHitState.bricks.find(
      (brick) => brick.id === 'typescript',
    );

    expect(afterFirstHit?.destroyed).toBe(false);
    expect(afterFirstHit?.hitsRemaining).toBe(1);
    expect(afterFirstHit?.crackLevel).toBe(1);

    const speedAfterFirstHit = getBallSpeed(firstHitState.ball);

    const secondHitInput = placeBallForTopHit(firstHitState, 'typescript');
    const secondHitState = stepArkanoidState(
      secondHitInput,
      { moveDirection: 0, pointerX: null },
      16,
    );

    const afterSecondHit = secondHitState.bricks.find(
      (brick) => brick.id === 'typescript',
    );
    const speedAfterSecondHit = getBallSpeed(secondHitState.ball);

    expect(afterSecondHit?.destroyed).toBe(true);
    expect(afterSecondHit?.hitsRemaining).toBe(0);
    expect(speedAfterSecondHit).toBeGreaterThan(speedAfterFirstHit);
  });

  it('bounces off walls and transitions to lose when crossing the floor', () => {
    const state = createInitialArkanoidState(testBlueprints);

    const withLeftWallCollision = {
      ...state,
      ball: {
        ...state.ball,
        x: state.ball.size / 2 + 0.2,
        vx: -180,
      },
    };

    const bounced = stepArkanoidState(
      withLeftWallCollision,
      { moveDirection: 0, pointerX: null },
      16,
    );

    expect(bounced.ball.vx).toBeGreaterThan(0);

    const withFloorCrossing = {
      ...bounced,
      ball: {
        ...bounced.ball,
        y: GAME_HEIGHT + bounced.ball.size,
        vy: 140,
      },
    };

    const lost = stepArkanoidState(
      withFloorCrossing,
      { moveDirection: 0, pointerX: null },
      16,
    );

    expect(lost.status).toBe('lose');
  });

  it('restarts the game with full durability and active status', () => {
    const state = createInitialArkanoidState(testBlueprints);
    const damaged = stepArkanoidState(
      placeBallForTopHit(state, 'typescript'),
      { moveDirection: 0, pointerX: null },
      16,
    );

    const restarted = restartArkanoidState(testBlueprints);

    expect(damaged.bricks[0]?.hitsRemaining).toBe(1);
    expect(restarted.status).toBe('active');
    expect(restarted.bricks[0]?.hitsRemaining).toBe(2);
    expect(restarted.bricks[1]?.hitsRemaining).toBe(1);
  });
});
