import type { BrickDurability, TechNodeId } from './stack.constants';

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 520;
export const BALL_SIZE = 8;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 14;

const BASE_BALL_SPEED = 360;
const KEYBOARD_PADDLE_SPEED = 560;
const BALL_SPEED_BOOST_FACTOR = 1.07;
const MAX_BALL_SPEED = 680;
const FLASH_DURATION_MS = 980;
const BRICK_ROW_LAYOUT = [3, 4, 3] as const;
const BRICK_WIDTH = 176;
const BRICK_HEIGHT = 44;
const BRICK_GAP_X = 18;
const BRICK_GAP_Y = 20;
const BRICK_START_Y = 88;
const BRICK_SLOT_COUNT = BRICK_ROW_LAYOUT.reduce(
  (sum, columns) => sum + columns,
  0,
);

type MoveDirection = -1 | 0 | 1;

export interface BrickBlueprint {
  readonly id: TechNodeId;
  readonly name: string;
  readonly errorSignature: string;
  readonly hitMessage: string;
  readonly durability: BrickDurability;
  readonly slot: number;
}

export interface BrickState extends BrickBlueprint {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly hitsRemaining: number;
  readonly maxHits: number;
  readonly destroyed: boolean;
  readonly crackLevel: number;
}

export interface PaddleState {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TrailPoint {
  readonly x: number;
  readonly y: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly size: number;
  readonly trail: readonly TrailPoint[];
}

export interface ArkanoidState {
  readonly status: 'active' | 'win' | 'lose';
  readonly elapsedMs: number;
  readonly paddle: PaddleState;
  readonly ball: BallState;
  readonly bricks: readonly BrickState[];
  readonly flashMessage: string | null;
  readonly flashTimerMs: number;
}

export interface ArkanoidInput {
  readonly moveDirection: MoveDirection;
  readonly pointerX: number | null;
}

interface Rect {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getBrickPosition(slot: number): { x: number; y: number } {
  const safeSlot = clamp(slot, 0, BRICK_SLOT_COUNT - 1);

  let row = 0;
  let slotStart = 0;

  for (const [index, rowColumns] of BRICK_ROW_LAYOUT.entries()) {
    const slotEnd = slotStart + rowColumns - 1;

    if (safeSlot >= slotStart && safeSlot <= slotEnd) {
      row = index;
      break;
    }

    slotStart = slotEnd + 1;
  }

  const columns = BRICK_ROW_LAYOUT[row] ?? BRICK_ROW_LAYOUT[0];
  const column = safeSlot - slotStart;
  const visualRow = BRICK_ROW_LAYOUT.length - 1 - row;
  const totalWidth = columns * BRICK_WIDTH + (columns - 1) * BRICK_GAP_X;
  const startX = (GAME_WIDTH - totalWidth) / 2;

  return {
    x: startX + column * (BRICK_WIDTH + BRICK_GAP_X) + BRICK_WIDTH / 2,
    y:
      BRICK_START_Y +
      visualRow * (BRICK_HEIGHT + BRICK_GAP_Y) +
      BRICK_HEIGHT / 2,
  };
}

function createBrick(blueprint: BrickBlueprint): BrickState {
  const { x, y } = getBrickPosition(blueprint.slot);

  return {
    ...blueprint,
    x,
    y,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    hitsRemaining: blueprint.durability,
    maxHits: blueprint.durability,
    destroyed: false,
    crackLevel: 0,
  };
}

function createBall(): BallState {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 92,
    vx: BASE_BALL_SPEED * 0.42,
    vy: -BASE_BALL_SPEED,
    size: BALL_SIZE,
    trail: [],
  };
}

function createPaddle(): PaddleState {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 46,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  };
}

function toBallRect(ball: BallState): Rect {
  const half = ball.size / 2;

  return {
    left: ball.x - half,
    right: ball.x + half,
    top: ball.y - half,
    bottom: ball.y + half,
  };
}

function toPaddleRect(paddle: PaddleState): Rect {
  return {
    left: paddle.x - paddle.width / 2,
    right: paddle.x + paddle.width / 2,
    top: paddle.y - paddle.height / 2,
    bottom: paddle.y + paddle.height / 2,
  };
}

function toBrickRect(brick: BrickState): Rect {
  return {
    left: brick.x - brick.width / 2,
    right: brick.x + brick.width / 2,
    top: brick.y - brick.height / 2,
    bottom: brick.y + brick.height / 2,
  };
}

function intersects(a: Rect, b: Rect): boolean {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

function withUpdatedPaddle(
  paddle: PaddleState,
  input: ArkanoidInput,
  deltaSeconds: number,
): PaddleState {
  const minX = paddle.width / 2;
  const maxX = GAME_WIDTH - paddle.width / 2;

  if (input.pointerX !== null) {
    return {
      ...paddle,
      x: clamp(input.pointerX, minX, maxX),
    };
  }

  const keyboardX =
    paddle.x + input.moveDirection * KEYBOARD_PADDLE_SPEED * deltaSeconds;

  return {
    ...paddle,
    x: clamp(keyboardX, minX, maxX),
  };
}

function normalizeSpeed(
  vx: number,
  vy: number,
): { vx: number; vy: number; speed: number } {
  const speed = Math.hypot(vx, vy);

  if (speed <= MAX_BALL_SPEED) {
    return { vx, vy, speed };
  }

  const scale = MAX_BALL_SPEED / speed;

  return {
    vx: vx * scale,
    vy: vy * scale,
    speed: MAX_BALL_SPEED,
  };
}

export function createInitialArkanoidState(
  blueprints: readonly BrickBlueprint[],
): ArkanoidState {
  return {
    status: 'active',
    elapsedMs: 0,
    paddle: createPaddle(),
    ball: createBall(),
    bricks: blueprints
      .slice()
      .sort((left, right) => left.slot - right.slot)
      .map((blueprint) => createBrick(blueprint)),
    flashMessage: null,
    flashTimerMs: 0,
  };
}

export function restartArkanoidState(
  blueprints: readonly BrickBlueprint[],
): ArkanoidState {
  return createInitialArkanoidState(blueprints);
}

function resolveWallCollisions(ball: BallState): BallState {
  let nextX = ball.x;
  let nextY = ball.y;
  let nextVx = ball.vx;
  let nextVy = ball.vy;
  const half = ball.size / 2;

  if (nextX - half <= 0) {
    nextX = half;
    nextVx = Math.abs(nextVx);
  }

  if (nextX + half >= GAME_WIDTH) {
    nextX = GAME_WIDTH - half;
    nextVx = -Math.abs(nextVx);
  }

  if (nextY - half <= 0) {
    nextY = half;
    nextVy = Math.abs(nextVy);
  }

  return {
    ...ball,
    x: nextX,
    y: nextY,
    vx: nextVx,
    vy: nextVy,
  };
}

interface BrickCollisionResult {
  readonly ball: BallState;
  readonly bricks: readonly BrickState[];
  readonly flashMessage: string | null;
  readonly speedBoost: boolean;
}

function resolveBrickCollision(
  ball: BallState,
  bricks: readonly BrickState[],
): BrickCollisionResult {
  const ballRect = toBallRect(ball);

  for (const brick of bricks) {
    if (brick.destroyed) {
      continue;
    }

    const brickRect = toBrickRect(brick);

    if (!intersects(ballRect, brickRect)) {
      continue;
    }

    const overlapX = Math.min(
      ballRect.right - brickRect.left,
      brickRect.right - ballRect.left,
    );
    const overlapY = Math.min(
      ballRect.bottom - brickRect.top,
      brickRect.bottom - ballRect.top,
    );

    const reflectedBall =
      overlapX < overlapY
        ? {
            ...ball,
            vx: ball.vx * -1,
          }
        : {
            ...ball,
            vy: ball.vy * -1,
          };

    const hitsRemaining = Math.max(0, brick.hitsRemaining - 1);
    const destroyed = hitsRemaining <= 0;
    const crackLevel = destroyed
      ? brick.maxHits
      : brick.maxHits - hitsRemaining;

    const nextBricks = bricks.map((currentBrick) => {
      if (currentBrick.id !== brick.id) {
        return currentBrick;
      }

      return {
        ...currentBrick,
        hitsRemaining,
        destroyed,
        crackLevel,
      };
    });

    return {
      ball: reflectedBall,
      bricks: nextBricks,
      flashMessage: brick.hitMessage,
      speedBoost: destroyed && brick.maxHits > 1,
    };
  }

  return {
    ball,
    bricks,
    flashMessage: null,
    speedBoost: false,
  };
}

function resolvePaddleCollision(
  ball: BallState,
  paddle: PaddleState,
): BallState {
  const paddleRect = toPaddleRect(paddle);
  const ballRect = toBallRect(ball);

  if (!intersects(ballRect, paddleRect) || ball.vy < 0) {
    return ball;
  }

  const speed = Math.hypot(ball.vx, ball.vy);
  const offset = (ball.x - paddle.x) / (paddle.width / 2);
  const clampedOffset = clamp(offset, -1, 1);
  const angle = clampedOffset * (Math.PI / 3);

  return {
    ...ball,
    y: paddleRect.top - ball.size / 2,
    vx: speed * Math.sin(angle),
    vy: -Math.abs(speed * Math.cos(angle)),
  };
}

export function stepArkanoidState(
  state: ArkanoidState,
  input: ArkanoidInput,
  deltaMs: number,
): ArkanoidState {
  if (state.status !== 'active') {
    return state;
  }

  const boundedDeltaMs = clamp(deltaMs, 0, 32);
  const deltaSeconds = boundedDeltaMs / 1000;
  const nextPaddle = withUpdatedPaddle(state.paddle, input, deltaSeconds);

  const movedBall = {
    ...state.ball,
    x: state.ball.x + state.ball.vx * deltaSeconds,
    y: state.ball.y + state.ball.vy * deltaSeconds,
    trail: [{ x: state.ball.x, y: state.ball.y }, ...state.ball.trail].slice(
      0,
      3,
    ),
  };

  const afterWalls = resolveWallCollisions(movedBall);
  const afterPaddle = resolvePaddleCollision(afterWalls, nextPaddle);
  const brickResolution = resolveBrickCollision(afterPaddle, state.bricks);

  let resolvedBall = brickResolution.ball;

  if (brickResolution.speedBoost) {
    const speedBoost = normalizeSpeed(
      resolvedBall.vx * BALL_SPEED_BOOST_FACTOR,
      resolvedBall.vy * BALL_SPEED_BOOST_FACTOR,
    );

    resolvedBall = {
      ...resolvedBall,
      vx: speedBoost.vx,
      vy: speedBoost.vy,
    };
  }

  const elapsedMs = state.elapsedMs + boundedDeltaMs;
  const flashMessage = brickResolution.flashMessage ?? state.flashMessage;
  const flashTimerMs = brickResolution.flashMessage
    ? FLASH_DURATION_MS
    : Math.max(0, state.flashTimerMs - boundedDeltaMs);
  const allDestroyed = brickResolution.bricks.every((brick) => brick.destroyed);
  const lost = resolvedBall.y - resolvedBall.size / 2 > GAME_HEIGHT;

  return {
    status: lost ? 'lose' : allDestroyed ? 'win' : 'active',
    elapsedMs,
    paddle: nextPaddle,
    ball: resolvedBall,
    bricks: brickResolution.bricks,
    flashMessage: flashTimerMs > 0 ? flashMessage : null,
    flashTimerMs,
  };
}

export function getBallSpeed(ball: BallState): number {
  return Math.hypot(ball.vx, ball.vy);
}

export function getRemainingBricks(bricks: readonly BrickState[]): number {
  return bricks.filter((brick) => !brick.destroyed).length;
}
