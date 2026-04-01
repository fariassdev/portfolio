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

import { useFocusTrap } from '@/hooks/use-focus-trap';

import type { ArkanoidState, BrickBlueprint } from './stack-game';
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
const REASSEMBLE_MS = 1460;
const WIN_FLASH_MS = 420;
const WIN_LOG_LINE_MS = 280;

const SPINNER_FRAMES = ['|', '/', '-', '\\'] as const;

type TechNode = (typeof techNodes)[number];
type StackPhase =
  | 'constellation'
  | 'transition_compiling'
  | 'transition_breaking'
  | 'transition_deploy'
  | 'game_active'
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
      return 'Arkanoid game active. Use mouse, touch drag, or arrow keys to move the paddle.';
    case 'game_win':
      return `Build successful in ${(buildDurationMs / 1000).toFixed(2)} seconds.`;
    case 'game_lose':
      return 'Build failed. Retry prompt available with Enter or Y.';
    case 'reassemble':
      return 'Reassembling the constellation graph.';
    case 'constellation':
    default:
      return 'Constellation map ready.';
  }
}

function createWinLogs(buildDurationMs: number): readonly string[] {
  return [
    '> npm run build',
    '> collecting traces...',
    `> build finished in ${(buildDurationMs / 1000).toFixed(2)}s`,
    '> deploying artifacts to constellation.prod',
    '> status: SUCCESS',
  ];
}

export function Stack() {
  const reduceMotion = useReducedMotion() ?? false;
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
  const [winLogLines, setWinLogLines] = useState<readonly string[]>([]);
  const [buildDurationMs, setBuildDurationMs] = useState(0);
  const [isWinFlashVisible, setIsWinFlashVisible] = useState(false);
  const [gameState, setGameState] = useState<ArkanoidState>(() =>
    createInitialArkanoidState(arkanoidBlueprints),
  );

  const loseOverlayRef = useFocusTrap(
    phase === 'game_lose',
  ) as RefObject<HTMLDivElement>;
  const timeoutIdsRef = useRef<number[]>([]);
  const intervalIdsRef = useRef<number[]>([]);
  const inputRef = useRef<MutableArkanoidInput>({
    moveDirection: 0,
    pointerX: null,
  });
  const isDraggingRef = useRef(false);

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
    return () => {
      clearScheduledTimers();
    };
  }, [clearScheduledTimers]);

  useEffect(() => {
    setStatusAnnouncement(getPhaseAnnouncement(phase, buildDurationMs));
  }, [buildDurationMs, phase]);

  useEffect(() => {
    if (!reduceMotion) {
      return;
    }

    clearScheduledTimers();
    setPhase('constellation');
    setGameState(restartArkanoidState(arkanoidBlueprints));
    setWinLogLines([]);
    setIsWinFlashVisible(false);
    setCompilingDisconnectCount(0);
    setCompilingSpinnerIndex(0);
    setBreakingNodeIndex(0);
    setDeployProgress(0);
    setReassembleProgress(0);
  }, [clearScheduledTimers, reduceMotion]);

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
    setWinLogLines([]);
    setIsWinFlashVisible(false);
    setPhase('game_active');
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
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown);
    };
  }, [phase, restartFromLose]);

  useEffect(() => {
    clearScheduledTimers();

    if (phase === 'transition_compiling') {
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

    if (phase === 'game_win') {
      const winLogs = createWinLogs(buildDurationMs);

      setWinLogLines([]);
      setIsWinFlashVisible(true);

      queueTimeout(() => {
        setIsWinFlashVisible(false);
      }, WIN_FLASH_MS);

      for (const [index, line] of winLogs.entries()) {
        queueTimeout(
          () => {
            setWinLogLines((previousLines) => [...previousLines, line]);
          },
          WIN_FLASH_MS + index * WIN_LOG_LINE_MS,
        );
      }

      queueTimeout(
        () => {
          setReassembleProgress(0);
          setPhase('reassemble');
        },
        WIN_FLASH_MS + winLogs.length * WIN_LOG_LINE_MS + 360,
      );
    }

    if (phase === 'reassemble') {
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
        setPhase('constellation');
      }, REASSEMBLE_MS);
    }

    return () => {
      clearScheduledTimers();
    };
  }, [
    buildDurationMs,
    clearScheduledTimers,
    phase,
    queueInterval,
    queueTimeout,
  ]);

  const onGameFrame = useCallback((deltaMs: number) => {
    setGameState((currentState) => {
      return stepArkanoidState(currentState, inputRef.current, deltaMs);
    });
  }, []);

  useGameLoop(phase === 'game_active', onGameFrame);

  useEffect(() => {
    if (phase !== 'game_active') {
      return;
    }

    if (gameState.status === 'win') {
      setBuildDurationMs(gameState.elapsedMs);
      setPhase('game_win');
      return;
    }

    if (gameState.status === 'lose') {
      setPhase('game_lose');
    }
  }, [gameState.elapsedMs, gameState.status, phase]);

  const startNarrativeGame = useCallback(() => {
    if (reduceMotion || phase !== 'constellation') {
      return;
    }

    setActiveNodeId(null);
    setGameState(restartArkanoidState(arkanoidBlueprints));
    setWinLogLines([]);
    setBuildDurationMs(0);
    setIsWinFlashVisible(false);
    setCompilingSpinnerIndex(0);
    setCompilingDisconnectCount(0);
    setBreakingNodeIndex(0);
    setDeployProgress(0);
    setReassembleProgress(0);
    setPhase('transition_compiling');
  }, [phase, reduceMotion]);

  const isConstellationInteractive = !reduceMotion && phase === 'constellation';
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
    phase === 'game_win' ||
    phase === 'game_lose';
  const showErrorSignatures =
    phase === 'transition_breaking' ||
    phase === 'transition_deploy' ||
    phase === 'game_active' ||
    phase === 'game_win' ||
    phase === 'game_lose';
  const reconnectCount = Math.floor(reassembleProgress * techEdges.length);

  const positionedNodeMap = useMemo(() => {
    const positions = new Map<TechNodeId, NodePosition>();

    for (const node of techNodes) {
      const targetBrickPosition = staticBrickPositions.get(node.id) ?? {
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
  }, [deployProgress, phase, reassembleProgress, staticBrickPositions]);

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
      : phase === 'game_active' || phase === 'game_win' || phase === 'game_lose'
        ? 1
        : 0;

  const gameHintDescriptionId =
    phase === 'game_active' || phase === 'game_lose'
      ? 'stack-constellation-description stack-game-controls'
      : 'stack-constellation-description';

  const triggerDisabled = reduceMotion || phase !== 'constellation';

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

      if (reduceMotion) {
        edgeState = 'static';
      } else if (phase === 'transition_compiling') {
        edgeState =
          edgeIndex < compilingDisconnectCount ? 'disconnected' : 'idle';
      } else if (
        phase === 'transition_breaking' ||
        phase === 'transition_deploy' ||
        phase === 'game_active' ||
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
    reduceMotion,
  ]);

  const nodeElements = useMemo(() => {
    return techNodes.map((node) => {
      const positionedNode = positionedNodeMap.get(node.id);

      if (!positionedNode) {
        return null;
      }

      const brickState = brickMap.get(node.id);
      const floatX = Math.max(2.5, node.floatRangeX * 5);
      const floatY = Math.max(2.5, node.floatRangeY * 5);
      const floatDuration = 14 / node.floatSpeed;
      const isBreakingNode =
        phase === 'transition_breaking' &&
        techNodes[breakingNodeIndex]?.id === node.id;
      const isDestroyed = renderAsBricks
        ? brickState?.destroyed === true
        : false;
      const errorLabel = `${node.errorSignature}`;
      const baseLabel = `${node.name} (${clusterNames[node.cluster]})`;
      const ariaLabel = showErrorSignatures
        ? `${errorLabel} (${baseLabel})`
        : baseLabel;
      const visibleLabel = showErrorSignatures ? errorLabel : node.name;

      const nodeStyle = {
        '--node-x': `${positionedNode.x}%`,
        '--node-y': `${positionedNode.y}%`,
        '--float-x': `${floatX.toFixed(2)}px`,
        '--float-y': `${floatY.toFixed(2)}px`,
        '--float-duration': `${floatDuration.toFixed(2)}s`,
        '--float-delay': `${(-node.floatPhase).toFixed(2)}s`,
      } as CSSProperties;

      let nodeState: NodeState = 'idle';

      if (reduceMotion) {
        nodeState = 'static';
      } else if (phase === 'transition_breaking') {
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
            <span className={styles.nodeName}>{visibleLabel}</span>
            {renderAsBricks && brickState && brickState.maxHits > 1 ? (
              <span
                className={styles.brickHits}
                data-testid={`stack-brick-hits-${node.id}`}
              >
                {Math.max(0, brickState.hitsRemaining)}
              </span>
            ) : null}
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
    hasActiveNode,
    isConstellationInteractive,
    onActivateNode,
    onDeactivateNode,
    phase,
    positionedNodeMap,
    reduceMotion,
    renderAsBricks,
    showErrorSignatures,
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
          className={cx(
            styles.constellationCanvas,
            reduceMotion ? styles.reducedMotion : styles.motionEnabled,
            phase === 'game_win' && isWinFlashVisible && styles.winFlash,
          )}
          data-phase={phase}
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
            <span className={styles.runTriggerGlyph} aria-hidden="true">
              {'>'}
            </span>
            <span className={styles.runTriggerCommand}>run game.ts</span>
            <span className={styles.runTriggerCursor} aria-hidden="true" />
          </button>

          {reduceMotion ? (
            <p
              id="stack-reduced-motion-note"
              className={styles.reducedMotionNotice}
            >
              Gameplay disabled because reduced motion is enabled.
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

          {phase === 'game_active' && gameState.flashMessage ? (
            <div className={styles.hitFlash} role="status" aria-live="polite">
              {gameState.flashMessage}
            </div>
          ) : null}

          {phase === 'game_win' ? (
            <div
              className={styles.winTerminal}
              data-testid="stack-win-terminal"
              role="status"
              aria-live="polite"
            >
              <p className={styles.terminalHeader}>build complete</p>
              <div className={styles.terminalBody}>
                {winLogLines.map((line, index) => (
                  <p key={`${line}-${index}`} className={styles.terminalLine}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {phase === 'game_lose' ? (
            <div
              className={styles.loseTerminal}
              data-testid="stack-lose-terminal"
              ref={loseOverlayRef}
              role="dialog"
              aria-label="Build failed terminal prompt"
            >
              <p className={styles.terminalHeader}>
                process exited with code 1
              </p>
              <p className={styles.terminalLine}>
                Retry deploy? [Y/n]
                <span className={styles.runTriggerCursor} aria-hidden="true" />
              </p>
              <button
                type="button"
                className={styles.retryButton}
                onClick={restartFromLose}
                data-testid="stack-retry-button"
              >
                Y
              </button>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
