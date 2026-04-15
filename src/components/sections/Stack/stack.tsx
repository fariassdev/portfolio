'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import { Button } from '@/components/ui/Button';
import { useFocusTrap } from '@/hooks/use-focus-trap';

import type { ArkanoidState, BrickBlueprint, BrickHitbox } from './stack-game';
import {
  createInitialArkanoidState,
  GAME_HEIGHT,
  GAME_WIDTH,
  restartArkanoidState,
  stepArkanoidState,
} from './stack-game';
import type { Proficiency, TechCluster, TechNodeId } from './stack.constants';
import {
  clusterLabels,
  clusterNames,
  deploySteps,
  techEdges,
  techNodes,
} from './stack.constants';
import styles from './stack.module.css';
import { useGameLoop } from './use-game-loop';

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

const graphVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
} as const;

const TRANSITION_COMPILING_MS = 1680;
const TRANSITION_BREAKING_MS = 1520;
const TRANSITION_DEPLOY_MS = 1080;
const WIN_COMPOSE_MS = 1120;
const REASSEMBLE_MS = 1460;
const WIN_FLASH_MS = 420;

const SPINNER_FRAMES = ['|', '/', '-', '\\'] as const;
const DEPLOY_SPINNER_FRAMES = ['⠋', '⠙', '⠸', '⠴', '⠦', '⠇'] as const;

const MOBILE_BRICK_ROW_LAYOUT = [3, 2, 2, 3] as const;
const MOBILE_SMALL_BRICK_ROW_LAYOUT = [2, 2, 2, 2, 2] as const;

type TechNode = (typeof techNodes)[number];
type BrickLayoutMode = 'desktop' | 'mobile' | 'mobile_small';
type StackPhase =
  | 'constellation'
  | 'transition_compiling'
  | 'transition_breaking'
  | 'transition_deploy'
  | 'game_active'
  | 'game_win_composing'
  | 'game_win'
  | 'game_lose'
  | 'reassemble';

type NodeState =
  | 'static'
  | 'idle'
  | 'active'
  | 'connected'
  | 'muted'
  | 'breaking'
  | 'brick'
  | 'destroyed';

type EdgeState =
  | 'static'
  | 'idle'
  | 'active'
  | 'muted'
  | 'disconnected'
  | 'reconnecting';

interface TechNodeCardProps {
  readonly node: TechNode;
  readonly interactive: boolean;
  readonly label: string;
  readonly className: string;
  readonly state: NodeState;
  readonly onActivate?: (nodeId: TechNodeId) => void;
  readonly onDeactivate?: () => void;
  readonly children: ReactNode;
}

interface NodePosition {
  readonly x: number;
  readonly y: number;
}

interface MutableArkanoidInput {
  moveDirection: -1 | 0 | 1;
  pointerX: number | null;
}

type DeployProgressMap = Record<TechNodeId, boolean>;

const COMPACT_DEPLOY_LABELS: Readonly<Record<TechNodeId, string>> = {
  typescript: 'Compile',
  nodejs: 'Boot',
  graphql: 'Schema',
  postgresql: 'Migrate',
  redis: 'Prime',
  react: 'Bundle',
  nextjs: 'Prerender',
  docker: 'Image',
  kubernetes: 'Rollout',
  terraform: 'Apply',
};

const MICRO_DEPLOY_LABELS: Readonly<Record<TechNodeId, string>> = {
  typescript: 'TS',
  nodejs: 'Node',
  graphql: 'GQL',
  postgresql: 'SQL',
  redis: 'Redis',
  react: 'React',
  nextjs: 'Next',
  docker: 'Docker',
  kubernetes: 'K8s',
  terraform: 'TF',
};

function getBrickLayoutMode(viewportWidth: number): BrickLayoutMode {
  if (viewportWidth <= 400) {
    return 'mobile_small';
  }

  if (viewportWidth <= 696) {
    return 'mobile';
  }

  return 'desktop';
}

const arkanoidBlueprints: readonly BrickBlueprint[] = techNodes.map((node) => ({
  id: node.id,
  name: node.name,
  errorSignature: node.errorSignature,
  hitMessage: node.hitMessage,
  durability: node.brickDurability,
  slot: node.brickSlot,
}));

const clusterClassNames = {
  backend: styles.clusterBackend,
  data: styles.clusterData,
  infrastructure: styles.clusterInfrastructure,
} as const satisfies Record<TechCluster, string | undefined>;

const clusterLabelClassNames = {
  backend: styles.clusterLabelBackend,
  data: styles.clusterLabelData,
  infrastructure: styles.clusterLabelInfrastructure,
} as const satisfies Record<TechCluster, string | undefined>;

function cx(
  ...classNames: readonly (false | null | string | undefined)[]
): string {
  return classNames.filter(Boolean).join(' ');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function getProficiencyClassName(proficiency: Proficiency): string | undefined {
  switch (proficiency) {
    case 'Primary':
      return styles.proficiencyPrimary;
    case 'Secondary':
      return styles.proficiencySecondary;
    case 'Learning':
      return styles.proficiencyLearning;
    default:
      return '';
  }
}

function createAdjacencyMap(): Map<TechNodeId, Set<TechNodeId>> {
  const map = new Map<TechNodeId, Set<TechNodeId>>();

  for (const [left, right] of techEdges) {
    const leftNeighbors = map.get(left) ?? new Set<TechNodeId>();
    leftNeighbors.add(right);
    map.set(left, leftNeighbors);

    const rightNeighbors = map.get(right) ?? new Set<TechNodeId>();
    rightNeighbors.add(left);
    map.set(right, rightNeighbors);
  }

  return map;
}

function TechNodeCard({
  node,
  interactive,
  label,
  className,
  state,
  onActivate,
  onDeactivate,
  children,
}: TechNodeCardProps) {
  if (!interactive) {
    return (
      <div
        className={className}
        data-testid={`stack-node-${node.id}`}
        data-tech-node-id={node.id}
        data-state={state}
        aria-label={label}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      data-testid={`stack-node-${node.id}`}
      data-tech-node-id={node.id}
      data-state={state}
      aria-label={label}
      onMouseEnter={() => onActivate?.(node.id)}
      onMouseLeave={onDeactivate}
      onFocus={() => onActivate?.(node.id)}
      onBlur={onDeactivate}
    >
      {children}
    </button>
  );
}

function getPhaseAnnouncement(
  phase: StackPhase,
  buildDurationMs: number,
): string {
  switch (phase) {
    case 'transition_compiling':
      return 'Compiling graph dependencies.';
    case 'transition_breaking':
      return 'Breaking constellation into error signatures.';
    case 'transition_deploy':
      return 'Deploying Arkanoid runtime.';
    case 'game_active':
      return 'Deploy simulation active. Use mouse, touch drag, or arrow keys to move the paddle.';
    case 'game_win_composing':
      return 'Composing final deploy CLI.';
    case 'game_win':
      return `Stack deployed in ${(buildDurationMs / 1000).toFixed(2)} seconds.`;
    case 'game_lose':
      return 'Deploy failed. Retry or skip to deployed.';
    case 'reassemble':
      return 'Reassembling the constellation graph.';
    case 'constellation':
    default:
      return 'Constellation map ready.';
  }
}

function createDeployProgressMap(): DeployProgressMap {
  return techNodes.reduce((accumulator, node) => {
    accumulator[node.id] = false;
    return accumulator;
  }, {} as DeployProgressMap);
}

function formatElapsedSeconds(elapsedMs: number): string {
  return `${(elapsedMs / 1000).toFixed(1)}s`;
}

function stripTrailingEllipsis(value: string): string {
  return value.replace(/\.\.\.$/, '').trimEnd();
}

function createBrickPositionMapFromRows(
  rowLayout: readonly number[],
  options: {
    readonly topY: number;
    readonly rowGap: number;
    readonly leftX: number;
    readonly rightX: number;
  },
): Map<TechNodeId, NodePosition> {
  const sortedNodes = techNodes
    .slice()
    .sort((left, right) => left.brickSlot - right.brickSlot);
  const positions = new Map<TechNodeId, NodePosition>();
  let nodeIndex = 0;

  rowLayout.forEach((columns, rowIndex) => {
    if (columns <= 0) {
      return;
    }

    const y = options.topY + rowIndex * options.rowGap;
    const stepX =
      columns > 1 ? (options.rightX - options.leftX) / (columns - 1) : 0;

    for (let column = 0; column < columns; column += 1) {
      const node = sortedNodes[nodeIndex];

      if (!node) {
        return;
      }

      const x = columns === 1 ? 50 : options.leftX + column * stepX;

      positions.set(node.id, { x, y });
      nodeIndex += 1;
    }
  });

  return positions;
}

function getDeployStepLabelForLayout(
  node: TechNode,
  layoutMode: BrickLayoutMode,
): string {
  const fullLabel = stripTrailingEllipsis(node.deployStep);

  if (layoutMode === 'mobile_small') {
    return MICRO_DEPLOY_LABELS[node.id] ?? fullLabel;
  }

  if (layoutMode === 'mobile') {
    return COMPACT_DEPLOY_LABELS[node.id] ?? fullLabel;
  }

  return fullLabel;
}

function areBrickHitboxesEqual(
  left: readonly BrickHitbox[],
  right: readonly BrickHitbox[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftHitbox, index) => {
    const rightHitbox = right[index];

    if (!rightHitbox || leftHitbox.id !== rightHitbox.id) {
      return false;
    }

    return (
      Math.abs(leftHitbox.x - rightHitbox.x) < 0.1 &&
      Math.abs(leftHitbox.y - rightHitbox.y) < 0.1 &&
      Math.abs(leftHitbox.width - rightHitbox.width) < 0.1 &&
      Math.abs(leftHitbox.height - rightHitbox.height) < 0.1
    );
  });
}

export function Stack() {
  const reduceMotion = useReducedMotion() ?? false;
  const [brickLayoutMode, setBrickLayoutMode] =
    useState<BrickLayoutMode>('desktop');
  const [phase, setPhase] = useState<StackPhase>('constellation');
  const [activeNodeId, setActiveNodeId] = useState<TechNodeId | null>(null);
  const [compilingSpinnerIndex, setCompilingSpinnerIndex] = useState(0);
  const [compilingDisconnectCount, setCompilingDisconnectCount] = useState(0);
  const [breakingNodeIndex, setBreakingNodeIndex] = useState(0);
  const [deployProgress, setDeployProgress] = useState(0);
  const [reassembleProgress, setReassembleProgress] = useState(0);
  const [statusAnnouncement, setStatusAnnouncement] = useState(
    getPhaseAnnouncement('constellation', 0),
  );
  const [buildDurationMs, setBuildDurationMs] = useState(0);
  const [deployProgressMap, setDeployProgressMap] = useState<DeployProgressMap>(
    createDeployProgressMap,
  );
  const [highlightedDeployStepId, setHighlightedDeployStepId] =
    useState<TechNodeId | null>(null);
  const [wasSkippedToDeployed, setWasSkippedToDeployed] = useState(false);
  const [isWinFlashVisible, setIsWinFlashVisible] = useState(false);
  const [winComposeProgress, setWinComposeProgress] = useState(0);
  const [gameState, setGameState] = useState<ArkanoidState>(() =>
    createInitialArkanoidState(arkanoidBlueprints),
  );
  const [dynamicBrickHitboxes, setDynamicBrickHitboxes] = useState<
    readonly BrickHitbox[]
  >([]);

  const loseOverlayRef = useFocusTrap(
    phase === 'game_lose',
  ) as RefObject<HTMLDivElement>;
  const timeoutIdsRef = useRef<number[]>([]);
  const intervalIdsRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MutableArkanoidInput>({
    moveDirection: 0,
    pointerX: null,
  });
  const isDraggingRef = useRef(false);
  const previousDestroyedBricksRef = useRef<Set<TechNodeId>>(new Set());

  const adjacencyMap = useMemo(() => createAdjacencyMap(), []);
  const staticBrickPositions = useMemo(() => {
    const initialState = createInitialArkanoidState(arkanoidBlueprints);

    return new Map(
      initialState.bricks.map((brick) => {
        return [
          brick.id,
          {
            x: (brick.x / GAME_WIDTH) * 100,
            y: (brick.y / GAME_HEIGHT) * 100,
          },
        ];
      }),
    );
  }, []);
  const responsiveBrickPositions = useMemo(() => {
    if (brickLayoutMode === 'desktop') {
      return new Map<TechNodeId, NodePosition>();
    }

    if (brickLayoutMode === 'mobile_small') {
      return createBrickPositionMapFromRows(MOBILE_SMALL_BRICK_ROW_LAYOUT, {
        topY: 17,
        rowGap: 10.5,
        leftX: 18,
        rightX: 82,
      });
    }

    return createBrickPositionMapFromRows(MOBILE_BRICK_ROW_LAYOUT, {
      topY: 18,
      rowGap: 12.5,
      leftX: 12,
      rightX: 88,
    });
  }, [brickLayoutMode]);
  const targetBrickPositions = useMemo(() => {
    if (brickLayoutMode === 'desktop') {
      return staticBrickPositions;
    }

    return responsiveBrickPositions;
  }, [brickLayoutMode, responsiveBrickPositions, staticBrickPositions]);
  const winComposeTargetPositions = useMemo(() => {
    const startY = 22;
    const rowGap = 4.6;

    return new Map(
      deploySteps.map((step, index) => {
        return [
          step.nodeId,
          {
            x: 45,
            y: startY + index * rowGap,
          },
        ];
      }),
    );
  }, []);
  const brickMap = useMemo(() => {
    return new Map(gameState.bricks.map((brick) => [brick.id, brick]));
  }, [gameState.bricks]);

  const clearScheduledTimers = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }

    for (const intervalId of intervalIdsRef.current) {
      window.clearInterval(intervalId);
    }

    timeoutIdsRef.current = [];
    intervalIdsRef.current = [];
  }, []);

  const queueTimeout = useCallback((callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(callback, delayMs);
    timeoutIdsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  const queueInterval = useCallback((callback: () => void, delayMs: number) => {
    const intervalId = window.setInterval(callback, delayMs);
    intervalIdsRef.current.push(intervalId);
    return intervalId;
  }, []);

  useEffect(() => {
    const updateLayoutMode = () => {
      setBrickLayoutMode(getBrickLayoutMode(window.innerWidth));
    };

    updateLayoutMode();
    window.addEventListener('resize', updateLayoutMode);

    return () => {
      window.removeEventListener('resize', updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearScheduledTimers();
    };
  }, [clearScheduledTimers]);

  useEffect(() => {
    setStatusAnnouncement(getPhaseAnnouncement(phase, buildDurationMs));
  }, [buildDurationMs, phase]);

  useEffect(() => {
    if (reduceMotion) {
      setCompilingSpinnerIndex(0);
      setHighlightedDeployStepId(null);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (phase === 'game_active') {
      return;
    }

    inputRef.current = {
      moveDirection: 0,
      pointerX: null,
    };
    isDraggingRef.current = false;
  }, [phase]);

  const restartFromLose = useCallback(() => {
    setGameState(restartArkanoidState(arkanoidBlueprints));
    setDeployProgressMap(createDeployProgressMap());
    setHighlightedDeployStepId(null);
    setWasSkippedToDeployed(false);
    setIsWinFlashVisible(false);
    setWinComposeProgress(0);
    previousDestroyedBricksRef.current = new Set();
    setPhase('game_active');
  }, []);

  const skipToDeployed = useCallback(() => {
    setWasSkippedToDeployed(true);
    setBuildDurationMs(0);
    setDeployProgressMap(() => {
      const completed = createDeployProgressMap();

      for (const step of deploySteps) {
        completed[step.nodeId] = true;
      }

      return completed;
    });
    setHighlightedDeployStepId(null);
    setIsWinFlashVisible(false);
    setWinComposeProgress(0);
    setPhase('game_win');
  }, []);

  useEffect(() => {
    if (phase !== 'game_lose') {
      return;
    }

    const onWindowKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();

      if (event.key === 'Enter' || normalizedKey === 'y') {
        event.preventDefault();
        restartFromLose();
        return;
      }

      if (event.key === 'Escape' || normalizedKey === 's') {
        event.preventDefault();
        skipToDeployed();
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [phase, restartFromLose, skipToDeployed]);

  useEffect(() => {
    clearScheduledTimers();

    if (phase === 'transition_compiling') {
      if (reduceMotion) {
        setCompilingSpinnerIndex(0);
        setCompilingDisconnectCount(techEdges.length);
        setPhase('transition_breaking');
        return;
      }

      const startedAt = performance.now();

      setCompilingSpinnerIndex(0);
      setCompilingDisconnectCount(0);

      queueInterval(() => {
        const elapsed = performance.now() - startedAt;
        const progress = clamp(elapsed / TRANSITION_COMPILING_MS, 0, 1);

        setCompilingSpinnerIndex(
          Math.floor(elapsed / 120) % SPINNER_FRAMES.length,
        );
        setCompilingDisconnectCount(Math.floor(progress * techEdges.length));
      }, 60);

      queueTimeout(() => {
        setCompilingDisconnectCount(techEdges.length);
        setPhase('transition_breaking');
      }, TRANSITION_COMPILING_MS);
    }

    if (phase === 'transition_breaking') {
      if (reduceMotion) {
        setBreakingNodeIndex(techNodes.length - 1);
        setPhase('transition_deploy');
        return;
      }

      const startedAt = performance.now();

      setBreakingNodeIndex(0);

      queueInterval(() => {
        const elapsed = performance.now() - startedAt;
        const nodeStep = TRANSITION_BREAKING_MS / techNodes.length;
        setBreakingNodeIndex(
          clamp(Math.floor(elapsed / nodeStep), 0, techNodes.length - 1),
        );
      }, 60);

      queueTimeout(() => {
        setPhase('transition_deploy');
      }, TRANSITION_BREAKING_MS);
    }

    if (phase === 'transition_deploy') {
      if (reduceMotion) {
        setDeployProgress(1);
        setPhase('game_active');
        return;
      }

      const startedAt = performance.now();

      setDeployProgress(0);

      queueInterval(() => {
        const elapsed = performance.now() - startedAt;
        setDeployProgress(clamp(elapsed / TRANSITION_DEPLOY_MS, 0, 1));
      }, 16);

      queueTimeout(() => {
        setDeployProgress(1);
        setPhase('game_active');
      }, TRANSITION_DEPLOY_MS);
    }

    if (phase === 'game_win_composing') {
      if (reduceMotion) {
        setWinComposeProgress(1);
        setPhase('game_win');
        return;
      }

      const startedAt = performance.now();

      setWinComposeProgress(0);

      queueInterval(() => {
        const elapsed = performance.now() - startedAt;
        setWinComposeProgress(clamp(elapsed / WIN_COMPOSE_MS, 0, 1));
      }, 16);

      queueTimeout(() => {
        setWinComposeProgress(1);
        setPhase('game_win');
      }, WIN_COMPOSE_MS);
    }

    if (phase === 'game_win') {
      setIsWinFlashVisible(!reduceMotion);

      if (!reduceMotion) {
        queueTimeout(() => {
          setIsWinFlashVisible(false);
        }, WIN_FLASH_MS);
      }
    }

    if (phase === 'reassemble') {
      if (reduceMotion) {
        setReassembleProgress(1);
        setCompilingDisconnectCount(0);
        setActiveNodeId(null);
        setWinComposeProgress(0);
        setPhase('constellation');
        return;
      }

      const startedAt = performance.now();

      setReassembleProgress(0);
      setActiveNodeId(null);

      queueInterval(() => {
        const elapsed = performance.now() - startedAt;
        setReassembleProgress(clamp(elapsed / REASSEMBLE_MS, 0, 1));
      }, 16);

      queueTimeout(() => {
        setReassembleProgress(1);
        setCompilingDisconnectCount(0);
        setActiveNodeId(null);
        setWinComposeProgress(0);
        setPhase('constellation');
      }, REASSEMBLE_MS);
    }

    return () => {
      clearScheduledTimers();
    };
  }, [clearScheduledTimers, phase, queueInterval, queueTimeout, reduceMotion]);

  useEffect(() => {
    if (phase !== 'game_active') {
      setDynamicBrickHitboxes([]);
      return;
    }

    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    let frameId: number | null = null;

    const measureHitboxes = () => {
      const canvasRect = canvasElement.getBoundingClientRect();

      if (canvasRect.width <= 0 || canvasRect.height <= 0) {
        return;
      }

      const nextHitboxes: BrickHitbox[] = [];

      for (const node of techNodes) {
        const nodeElement = canvasElement.querySelector<HTMLElement>(
          `[data-tech-node-id="${node.id}"]`,
        );

        if (!nodeElement) {
          continue;
        }

        const nodeRect = nodeElement.getBoundingClientRect();
        const centerX = (nodeRect.left + nodeRect.right) / 2;
        const centerY = (nodeRect.top + nodeRect.bottom) / 2;

        nextHitboxes.push({
          id: node.id,
          x: clamp(
            ((centerX - canvasRect.left) / canvasRect.width) * GAME_WIDTH,
            0,
            GAME_WIDTH,
          ),
          y: clamp(
            ((centerY - canvasRect.top) / canvasRect.height) * GAME_HEIGHT,
            0,
            GAME_HEIGHT,
          ),
          width: Math.max(1, (nodeRect.width / canvasRect.width) * GAME_WIDTH),
          height: Math.max(
            1,
            (nodeRect.height / canvasRect.height) * GAME_HEIGHT,
          ),
        });
      }

      setDynamicBrickHitboxes((currentHitboxes) => {
        return areBrickHitboxesEqual(currentHitboxes, nextHitboxes)
          ? currentHitboxes
          : nextHitboxes;
      });
    };

    const queueMeasure = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        measureHitboxes();
      });
    };

    queueMeasure();

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;

    if (fonts) {
      void fonts.ready.then(() => {
        queueMeasure();
      });
    }

    const onWindowResize = () => {
      queueMeasure();
    };

    window.addEventListener('resize', onWindowResize);

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        queueMeasure();
      });

      resizeObserver.observe(canvasElement);

      for (const node of techNodes) {
        const nodeElement = canvasElement.querySelector<HTMLElement>(
          `[data-tech-node-id="${node.id}"]`,
        );

        if (nodeElement) {
          resizeObserver.observe(nodeElement);
        }
      }
    }

    return () => {
      window.removeEventListener('resize', onWindowResize);
      resizeObserver?.disconnect();

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [phase]);

  const onGameFrame = useCallback(
    (deltaMs: number) => {
      setGameState((currentState) => {
        return stepArkanoidState(currentState, inputRef.current, deltaMs, {
          brickHitboxes: dynamicBrickHitboxes,
        });
      });
    },
    [dynamicBrickHitboxes],
  );

  useGameLoop(phase === 'game_active', onGameFrame);

  useEffect(() => {
    if (phase !== 'game_active') {
      previousDestroyedBricksRef.current = new Set();
      return;
    }

    const destroyedNow = new Set<TechNodeId>();

    for (const brick of gameState.bricks) {
      if (brick.destroyed) {
        destroyedNow.add(brick.id);
      }
    }

    const newlyDestroyed = Array.from(destroyedNow).filter((brickId) => {
      return !previousDestroyedBricksRef.current.has(brickId);
    });

    if (newlyDestroyed.length > 0) {
      setDeployProgressMap((current) => {
        const next = { ...current };

        for (const brickId of newlyDestroyed) {
          if (!next[brickId]) {
            next[brickId] = true;
          }
        }

        return next;
      });

      const lastDestroyed = newlyDestroyed[newlyDestroyed.length - 1] ?? null;

      if (lastDestroyed) {
        setHighlightedDeployStepId(lastDestroyed);

        if (reduceMotion) {
          setHighlightedDeployStepId(null);
        } else {
          queueTimeout(() => {
            setHighlightedDeployStepId((current) => {
              return current === lastDestroyed ? null : current;
            });
          }, 220);
        }
      }
    }

    previousDestroyedBricksRef.current = destroyedNow;
  }, [
    gameState.bricks,
    gameState.elapsedMs,
    phase,
    queueTimeout,
    reduceMotion,
  ]);

  useEffect(() => {
    if (phase !== 'game_active') {
      return;
    }

    if (gameState.status === 'win') {
      setBuildDurationMs(gameState.elapsedMs);
      setWasSkippedToDeployed(false);
      setHighlightedDeployStepId(null);
      setDeployProgressMap((current) => {
        const next = { ...current };

        for (const step of deploySteps) {
          if (!next[step.nodeId]) {
            next[step.nodeId] = true;
          }
        }

        return next;
      });

      if (reduceMotion) {
        setWinComposeProgress(1);
        setPhase('game_win');
      } else {
        setWinComposeProgress(0);
        setPhase('game_win_composing');
      }

      return;
    }

    if (gameState.status === 'lose') {
      setHighlightedDeployStepId(null);
      setPhase('game_lose');
    }
  }, [gameState.elapsedMs, gameState.status, phase, reduceMotion]);

  const startNarrativeGame = useCallback(() => {
    if (phase !== 'constellation') {
      return;
    }

    setActiveNodeId(null);
    setGameState(restartArkanoidState(arkanoidBlueprints));
    setDeployProgressMap(createDeployProgressMap());
    setHighlightedDeployStepId(null);
    setWasSkippedToDeployed(false);
    setBuildDurationMs(0);
    setIsWinFlashVisible(false);
    setCompilingSpinnerIndex(0);
    setCompilingDisconnectCount(0);
    setBreakingNodeIndex(0);
    setDeployProgress(0);
    setWinComposeProgress(0);
    setReassembleProgress(0);
    previousDestroyedBricksRef.current = new Set();
    setPhase('transition_compiling');
  }, [phase]);

  const isConstellationInteractive = phase === 'constellation';
  const activeNode = isConstellationInteractive ? activeNodeId : null;

  const hasActiveNode = activeNode !== null;
  const activeConnections =
    activeNode !== null ? adjacencyMap.get(activeNode) : undefined;

  const onActivateNode = useCallback(
    (nodeId: TechNodeId) => {
      if (isConstellationInteractive) {
        setActiveNodeId(nodeId);
      }
    },
    [isConstellationInteractive],
  );

  const onDeactivateNode = useCallback(() => {
    if (isConstellationInteractive) {
      setActiveNodeId(null);
    }
  }, [isConstellationInteractive]);

  const renderAsBricks =
    phase === 'transition_deploy' ||
    phase === 'game_active' ||
    phase === 'game_win_composing' ||
    phase === 'game_win' ||
    phase === 'game_lose';
  const useCompactBrickLayout = renderAsBricks && brickLayoutMode !== 'desktop';
  const useDenseBrickLayout =
    renderAsBricks && brickLayoutMode === 'mobile_small';
  const showActiveDeployStep =
    phase === 'game_active' ||
    phase === 'game_lose' ||
    phase === 'game_win_composing';
  const reconnectCount = Math.floor(reassembleProgress * techEdges.length);

  const activeDeployStep = useMemo(() => {
    const nextPending = deploySteps.find((step) => {
      return !deployProgressMap[step.nodeId];
    });

    return nextPending ?? deploySteps[deploySteps.length - 1] ?? null;
  }, [deployProgressMap]);

  const positionedNodeMap = useMemo(() => {
    const positions = new Map<TechNodeId, NodePosition>();

    for (const node of techNodes) {
      const targetBrickPosition = targetBrickPositions.get(node.id) ?? {
        x: node.x,
        y: node.y,
      };

      if (phase === 'transition_deploy') {
        positions.set(node.id, {
          x: lerp(node.x, targetBrickPosition.x, deployProgress),
          y: lerp(node.y, targetBrickPosition.y, deployProgress),
        });
        continue;
      }

      if (phase === 'game_win_composing' && !wasSkippedToDeployed) {
        const composeTargetPosition =
          winComposeTargetPositions.get(node.id) ?? targetBrickPosition;

        positions.set(node.id, {
          x: lerp(
            targetBrickPosition.x,
            composeTargetPosition.x,
            winComposeProgress,
          ),
          y: lerp(
            targetBrickPosition.y,
            composeTargetPosition.y,
            winComposeProgress,
          ),
        });
        continue;
      }

      if (
        phase === 'game_active' ||
        phase === 'game_win' ||
        phase === 'game_lose'
      ) {
        positions.set(node.id, targetBrickPosition);
        continue;
      }

      if (phase === 'reassemble') {
        positions.set(node.id, {
          x: lerp(targetBrickPosition.x, node.x, reassembleProgress),
          y: lerp(targetBrickPosition.y, node.y, reassembleProgress),
        });
        continue;
      }

      positions.set(node.id, {
        x: node.x,
        y: node.y,
      });
    }

    return positions;
  }, [
    deployProgress,
    phase,
    reassembleProgress,
    targetBrickPositions,
    wasSkippedToDeployed,
    winComposeProgress,
    winComposeTargetPositions,
  ]);

  const onCanvasKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (phase !== 'game_active') {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      inputRef.current.pointerX = null;
      inputRef.current.moveDirection = -1;
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      inputRef.current.pointerX = null;
      inputRef.current.moveDirection = 1;
    }
  };

  const onCanvasKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (phase !== 'game_active') {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      inputRef.current.moveDirection = 0;
    }
  };

  const toGameX = (event: ReactPointerEvent<HTMLDivElement>): number => {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width <= 0) {
      return GAME_WIDTH / 2;
    }

    const relativeX = (event.clientX - bounds.left) / bounds.width;
    return clamp(relativeX * GAME_WIDTH, 0, GAME_WIDTH);
  };

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'game_active') {
      return;
    }

    event.currentTarget.focus();
    inputRef.current.pointerX = toGameX(event);
    isDraggingRef.current = true;

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const onCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'game_active') {
      return;
    }

    if (event.pointerType === 'mouse' || isDraggingRef.current) {
      inputRef.current.pointerX = toGameX(event);
    }
  };

  const onCanvasPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'game_active') {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isDraggingRef.current = false;

    if (event.pointerType !== 'mouse') {
      inputRef.current.pointerX = null;
    }
  };

  const paddleAppearProgress =
    phase === 'transition_deploy'
      ? deployProgress
      : phase === 'game_active' || phase === 'game_lose'
        ? 1
        : phase === 'game_win_composing'
          ? 1 - winComposeProgress
          : phase === 'game_win'
            ? 0
            : 0;

  const shouldShowRunTimer =
    phase !== 'constellation' && phase !== 'reassemble';
  const runTimerValue =
    wasSkippedToDeployed && phase === 'game_win'
      ? '--'
      : formatElapsedSeconds(
          phase === 'game_win' || phase === 'game_win_composing'
            ? buildDurationMs
            : gameState.elapsedMs,
        );

  const gameHintDescriptionId =
    phase === 'game_active' || phase === 'game_lose'
      ? 'stack-constellation-description stack-game-controls'
      : 'stack-constellation-description';

  const triggerDisabled = phase !== 'constellation';
  const gameplaySpinnerFrame = reduceMotion
    ? DEPLOY_SPINNER_FRAMES[0]
    : DEPLOY_SPINNER_FRAMES[
        Math.floor(gameState.elapsedMs / 120) % DEPLOY_SPINNER_FRAMES.length
      ];

  const clusterLabelElements = useMemo(() => {
    return clusterLabels.map((clusterLabel) => {
      const clusterStyle = {
        '--cluster-x': `${clusterLabel.x}%`,
        '--cluster-y': `${clusterLabel.y}%`,
      } as CSSProperties;

      return (
        <span
          key={clusterLabel.cluster}
          className={cx(
            styles.clusterLabel,
            clusterLabelClassNames[clusterLabel.cluster],
          )}
          style={clusterStyle}
        >
          {clusterNames[clusterLabel.cluster]}
        </span>
      );
    });
  }, []);

  const edgeElements = useMemo(() => {
    return techEdges.map(([from, to], edgeIndex) => {
      const source = positionedNodeMap.get(from);
      const target = positionedNodeMap.get(to);

      if (!source || !target) {
        return null;
      }

      let edgeState: EdgeState = 'idle';

      if (phase === 'transition_compiling') {
        edgeState =
          edgeIndex < compilingDisconnectCount ? 'disconnected' : 'idle';
      } else if (
        phase === 'transition_breaking' ||
        phase === 'transition_deploy' ||
        phase === 'game_active' ||
        phase === 'game_win_composing' ||
        phase === 'game_win' ||
        phase === 'game_lose'
      ) {
        edgeState = 'disconnected';
      } else if (phase === 'reassemble') {
        edgeState =
          edgeIndex < reconnectCount ? 'reconnecting' : 'disconnected';
      } else if (activeNode !== null) {
        edgeState =
          from === activeNode || to === activeNode ? 'active' : 'muted';
      }

      return (
        <line
          key={`${from}-${to}`}
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          className={cx(
            styles.connection,
            edgeState === 'active' && styles.connectionActive,
            edgeState === 'muted' && styles.connectionMuted,
            edgeState === 'disconnected' && styles.connectionDisconnected,
            edgeState === 'reconnecting' && styles.connectionReconnecting,
          )}
          data-testid={`stack-edge-${from}-${to}`}
          data-state={edgeState}
        />
      );
    });
  }, [
    activeNode,
    compilingDisconnectCount,
    phase,
    positionedNodeMap,
    reconnectCount,
  ]);

  const nodeElements = useMemo(() => {
    return techNodes.map((node) => {
      const positionedNode = positionedNodeMap.get(node.id);

      if (!positionedNode) {
        return null;
      }

      const brickState = brickMap.get(node.id);
      const isCompleted = deployProgressMap[node.id];
      const floatX = Math.max(2.5, node.floatRangeX * 5);
      const floatY = Math.max(2.5, node.floatRangeY * 5);
      const floatDuration = 14 / node.floatSpeed;
      const isBreakingNode =
        phase === 'transition_breaking' &&
        techNodes[breakingNodeIndex]?.id === node.id;
      const isDestroyed = renderAsBricks
        ? brickState?.destroyed === true
        : false;
      const baseLabel = `${node.name} (${clusterNames[node.cluster]})`;
      const ariaLabel = baseLabel;
      const visibleLabel = renderAsBricks
        ? getDeployStepLabelForLayout(node, brickLayoutMode)
        : node.name;

      const nodeStyle = {
        '--node-x': `${positionedNode.x}%`,
        '--node-y': `${positionedNode.y}%`,
        '--float-x': `${floatX.toFixed(2)}px`,
        '--float-y': `${floatY.toFixed(2)}px`,
        '--float-duration': `${floatDuration.toFixed(2)}s`,
        '--float-delay': `${(-node.floatPhase).toFixed(2)}s`,
      } as CSSProperties;

      let nodeState: NodeState = 'idle';

      if (phase === 'transition_breaking') {
        nodeState = 'breaking';
      } else if (renderAsBricks) {
        nodeState = isDestroyed ? 'destroyed' : 'brick';
      } else if (hasActiveNode) {
        if (activeNode === node.id) {
          nodeState = 'active';
        } else if (activeConnections?.has(node.id)) {
          nodeState = 'connected';
        } else {
          nodeState = 'muted';
        }
      }

      return (
        <li key={node.id} className={styles.nodeItem} style={nodeStyle}>
          <TechNodeCard
            node={node}
            interactive={isConstellationInteractive}
            label={ariaLabel}
            className={cx(
              styles.nodeCard,
              renderAsBricks && styles.nodeAsBrick,
              useCompactBrickLayout && styles.nodeAsBrickCompact,
              useDenseBrickLayout && styles.nodeAsBrickDense,
              clusterClassNames[node.cluster],
              getProficiencyClassName(node.proficiency),
              nodeState === 'active' && styles.nodeActive,
              nodeState === 'connected' && styles.nodeConnected,
              nodeState === 'muted' && styles.nodeMuted,
              nodeState === 'breaking' && styles.nodeBreaking,
              isBreakingNode && styles.nodeBreakingActive,
              nodeState === 'destroyed' && styles.nodeDestroyed,
            )}
            state={nodeState}
            onActivate={onActivateNode}
            onDeactivate={onDeactivateNode}
          >
            <span className={styles.nodeIconWrap} aria-hidden="true">
              <i className={`${styles.nodeIcon} ${node.iconClassName}`} />
            </span>

            {renderAsBricks ? (
              <span className={styles.nodeStepLine}>
                <span className={styles.nodeStepLabel}>{visibleLabel}</span>
                <span
                  className={cx(
                    styles.nodeStepStatus,
                    isCompleted
                      ? styles.nodeStepStatusCompleted
                      : styles.nodeStepStatusLoading,
                    isCompleted &&
                      highlightedDeployStepId === node.id &&
                      styles.nodeStepStatusHighlight,
                  )}
                  data-testid={`stack-brick-status-${node.id}`}
                >
                  {isCompleted ? '✓' : gameplaySpinnerFrame}
                </span>
              </span>
            ) : (
              <span className={styles.nodeName}>{visibleLabel}</span>
            )}

            {renderAsBricks &&
            brickState &&
            brickState.maxHits > 1 &&
            !brickState.destroyed &&
            brickState.crackLevel > 0 ? (
              <span
                className={styles.brickCrack}
                data-level={brickState.crackLevel}
                aria-hidden="true"
              />
            ) : null}
          </TechNodeCard>
        </li>
      );
    });
  }, [
    activeConnections,
    activeNode,
    breakingNodeIndex,
    brickMap,
    brickLayoutMode,
    deployProgressMap,
    gameplaySpinnerFrame,
    hasActiveNode,
    highlightedDeployStepId,
    isConstellationInteractive,
    onActivateNode,
    onDeactivateNode,
    phase,
    positionedNodeMap,
    renderAsBricks,
    useCompactBrickLayout,
    useDenseBrickLayout,
  ]);

  return (
    <section
      id="stack"
      className={styles.section}
      aria-labelledby="stack-title"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={styles.inner}
      >
        <motion.p
          className={styles.label}
          variants={headerVariants}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }
          }
        >
          Stack
        </motion.p>
        <motion.h2
          id="stack-title"
          className={styles.title}
          variants={headerVariants}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.1, ease: 'easeOut' }
          }
        >
          Technologies I use to build things that last.
        </motion.h2>

        <p id="stack-constellation-description" className="sr-only">
          Constellation map of backend, data, and infrastructure technologies.
        </p>
        <p id="stack-game-controls" className="sr-only">
          During Arkanoid mode, move the paddle with your mouse, horizontal
          touch drag, or keyboard arrows.
        </p>
        <p
          className="sr-only"
          aria-live="polite"
          data-testid="stack-announcement"
        >
          {statusAnnouncement}
        </p>

        <motion.div
          ref={canvasRef}
          className={cx(
            styles.constellationCanvas,
            reduceMotion ? styles.reducedMotion : styles.motionEnabled,
            phase === 'game_win' && isWinFlashVisible && styles.winFlash,
          )}
          data-phase={phase}
          data-brick-layout={brickLayoutMode}
          data-testid="stack-canvas"
          variants={graphVariants}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.55, delay: 0.15, ease: 'easeOut' }
          }
          tabIndex={phase === 'game_active' ? 0 : -1}
          onKeyDown={onCanvasKeyDown}
          onKeyUp={onCanvasKeyUp}
          onBlur={() => {
            if (phase === 'game_active') {
              inputRef.current.moveDirection = 0;
            }
          }}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerEnd}
          onPointerCancel={onCanvasPointerEnd}
          aria-describedby={gameHintDescriptionId}
        >
          {showActiveDeployStep && activeDeployStep ? (
            <div
              className={styles.activeDeployStep}
              data-testid="stack-active-step"
              aria-hidden="true"
            >
              <span className={styles.activeDeployStepLabel}>current step</span>
              <span className={styles.activeDeployStepLine}>
                <span className={styles.activeDeployStepText}>
                  {activeDeployStep.label}
                </span>
                <span
                  className={cx(
                    styles.activeDeployStepStatus,
                    deployProgressMap[activeDeployStep.nodeId]
                      ? styles.activeDeployStepStatusCompleted
                      : styles.activeDeployStepStatusLoading,
                  )}
                >
                  {deployProgressMap[activeDeployStep.nodeId]
                    ? '✓'
                    : gameplaySpinnerFrame}
                </span>
              </span>
            </div>
          ) : null}

          {shouldShowRunTimer ? (
            <div className={styles.runTimer} data-testid="stack-run-timer">
              <span className={styles.runTimerLabel}>build time</span>
              <span className={styles.runTimerValue}>{runTimerValue}</span>
            </div>
          ) : null}

          <div className={styles.clusterLabelLayer} aria-hidden="true">
            {clusterLabelElements}
          </div>

          <svg
            className={styles.connectionLayer}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-testid="stack-connections"
          >
            {edgeElements}
          </svg>

          <ul
            className={styles.nodeList}
            role="list"
            aria-describedby="stack-constellation-description"
          >
            {nodeElements}
          </ul>

          <button
            type="button"
            className={cx(
              styles.runTrigger,
              triggerDisabled && styles.runTriggerDisabled,
            )}
            onClick={startNarrativeGame}
            disabled={triggerDisabled}
            data-testid="stack-run-trigger"
            aria-disabled={triggerDisabled}
            aria-describedby={
              reduceMotion ? 'stack-reduced-motion-note' : undefined
            }
          >
            <span className={styles.runTriggerCommand}>$ ./deploy.sh</span>
            <span className={styles.runTriggerCursor} aria-hidden="true">
              █
            </span>
          </button>

          {reduceMotion ? (
            <p
              id="stack-reduced-motion-note"
              className={styles.reducedMotionNotice}
            >
              Reduced motion enabled: transitions are instant.
            </p>
          ) : null}

          {phase === 'transition_compiling' ? (
            <div
              className={styles.transitionOverlay}
              data-phase={phase}
              data-testid="stack-transition-compiling"
              aria-hidden="true"
            >
              <p className={styles.transitionTitle}>
                compiling... {SPINNER_FRAMES[compilingSpinnerIndex]}
              </p>
              <p className={styles.transitionMeta}>
                detached links: {compilingDisconnectCount}/{techEdges.length}
              </p>
            </div>
          ) : null}

          {phase === 'transition_breaking' ? (
            <div
              className={styles.transitionOverlay}
              data-phase={phase}
              data-testid="stack-transition-breaking"
              aria-hidden="true"
            >
              <p className={styles.transitionTitle}>
                breaking node signatures...
              </p>
              <p className={styles.transitionMeta}>
                remapped {Math.min(breakingNodeIndex + 1, techNodes.length)}/
                {techNodes.length}
              </p>
            </div>
          ) : null}

          {phase === 'transition_deploy' ? (
            <div
              className={styles.transitionOverlay}
              data-phase={phase}
              data-testid="stack-transition-deploy"
              aria-hidden="true"
            >
              <p className={styles.transitionTitle}>deploying runtime...</p>
              <p className={styles.transitionMeta}>
                grid alignment {(deployProgress * 100).toFixed(0)}%
              </p>
            </div>
          ) : null}

          {phase === 'game_win_composing' ? (
            <div
              className={styles.transitionOverlay}
              data-phase={phase}
              data-testid="stack-transition-compose"
              aria-hidden="true"
            >
              <p className={styles.transitionTitle}>
                composing deploy report...
              </p>
              <p className={styles.transitionMeta}>
                terminal sync {(winComposeProgress * 100).toFixed(0)}%
              </p>
            </div>
          ) : null}

          {renderAsBricks ? (
            <div
              className={styles.gameLayer}
              style={
                {
                  '--entity-progress': paddleAppearProgress.toFixed(2),
                } as CSSProperties
              }
              aria-hidden="true"
            >
              <div
                className={styles.paddle}
                style={
                  {
                    '--paddle-x': `${(gameState.paddle.x / GAME_WIDTH) * 100}%`,
                    '--paddle-y': `${(gameState.paddle.y / GAME_HEIGHT) * 100}%`,
                    '--paddle-width': `${(gameState.paddle.width / GAME_WIDTH) * 100}%`,
                    '--paddle-height': `${
                      (gameState.paddle.height / GAME_HEIGHT) * 100
                    }%`,
                  } as CSSProperties
                }
              />

              {gameState.ball.trail.map((trailPoint, index) => {
                const opacity = 0.42 - index * 0.12;

                return (
                  <div
                    key={`${trailPoint.x}-${trailPoint.y}-${index}`}
                    className={styles.ballTrail}
                    style={
                      {
                        '--trail-x': `${(trailPoint.x / GAME_WIDTH) * 100}%`,
                        '--trail-y': `${(trailPoint.y / GAME_HEIGHT) * 100}%`,
                        '--trail-size': `${(gameState.ball.size / GAME_WIDTH) * 100}%`,
                        '--trail-opacity': opacity.toFixed(2),
                      } as CSSProperties
                    }
                  />
                );
              })}

              <div
                className={styles.ball}
                style={
                  {
                    '--ball-x': `${(gameState.ball.x / GAME_WIDTH) * 100}%`,
                    '--ball-y': `${(gameState.ball.y / GAME_HEIGHT) * 100}%`,
                    '--ball-size': `${(gameState.ball.size / GAME_WIDTH) * 100}%`,
                  } as CSSProperties
                }
              />
            </div>
          ) : null}

          {phase === 'game_win' ? (
            <div
              className={cx(styles.winTerminal, styles.winTerminalExpanded)}
              data-testid="stack-win-terminal"
              role="status"
              aria-live="polite"
            >
              <p className={styles.terminalHeader}>$ ./deploy.sh</p>
              <div className={styles.terminalBody}>
                {deploySteps.map((step) => {
                  return (
                    <p
                      key={step.nodeId}
                      className={cx(
                        styles.terminalLine,
                        styles.terminalLineCompleted,
                      )}
                    >
                      <span className={styles.terminalStepPrefix}>→</span>
                      <span className={styles.terminalStepLabel}>
                        {step.label}
                      </span>
                      <span className={styles.terminalStepStatus}>✓</span>
                    </p>
                  );
                })}
              </div>

              <div className={styles.terminalSummary}>
                <p className={styles.terminalDivider}>
                  ─────────────────────────────────────────────────
                </p>
                <p className={styles.terminalSummaryLine}>
                  <span>STACK DEPLOYED</span>
                  <span>✓</span>
                </p>
                <p className={styles.terminalSummaryLine}>
                  <span>build time: </span>
                  <span>
                    {wasSkippedToDeployed
                      ? '--'
                      : formatElapsedSeconds(buildDurationMs)}
                  </span>
                </p>
                <p className={styles.terminalDivider}>
                  ─────────────────────────────────────────────────
                </p>
              </div>

              <div className={styles.terminalWhoami}>
                <p className={styles.terminalHeader}>$ whoami</p>
                <p className={styles.terminalIdentity}>farias/farias</p>
                <p className={styles.terminalQuote}>
                  {'>'} Backend is where I live.
                </p>
                <p className={styles.terminalQuote}>
                  {'>'} Everything else is where I help.
                </p>
                <p className={styles.terminalQuote}>
                  {'>'} Ownership makes the difference.
                </p>
              </div>

              <div className={styles.terminalCtas}>
                <Button
                  variant="primary"
                  href="#projects"
                  className={styles.terminalCtaPrimary}
                >
                  See what I&apos;ve built →
                </Button>
                <Button
                  variant="ghost"
                  href="#contact"
                  className={styles.terminalCtaSecondary}
                >
                  Let&apos;s talk →
                </Button>
              </div>
            </div>
          ) : null}

          {phase === 'game_lose' ? (
            <div
              className={styles.loseTerminal}
              data-testid="stack-lose-terminal"
              ref={loseOverlayRef}
              role="dialog"
              aria-label="Deploy failed terminal prompt"
            >
              <p className={styles.terminalHeader}>$ ./deploy.sh</p>
              <p className={styles.terminalLine}>✗ deployment failed</p>
              <p className={styles.terminalLineMuted}>exit code: 1</p>
              <p className={styles.terminalQuote}>
                {'>'} Rollbacks are features too.
              </p>
              <div className={styles.loseActions}>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={restartFromLose}
                  data-testid="stack-retry-button"
                >
                  retry
                </button>
                <button
                  type="button"
                  className={styles.skipButton}
                  onClick={skipToDeployed}
                  data-testid="stack-skip-button"
                >
                  skip to deployed →
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
