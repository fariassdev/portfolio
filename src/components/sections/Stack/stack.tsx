'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import type { Proficiency, TechCluster, TechNodeId } from './stack.constants';
import {
  clusterLabels,
  clusterNames,
  techEdges,
  techNodes,
} from './stack.constants';
import styles from './stack.module.css';

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

const graphVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
} as const;

type TechNode = (typeof techNodes)[number];
type NodeState = 'static' | 'idle' | 'active' | 'connected' | 'muted';
type EdgeState = 'static' | 'idle' | 'active' | 'muted';

interface TechNodeCardProps {
  readonly node: TechNode;
  readonly reduceMotion: boolean;
  readonly className: string;
  readonly state: NodeState;
  readonly onActivate: (nodeId: TechNodeId) => void;
  readonly onDeactivate: () => void;
  readonly children: ReactNode;
}

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
  reduceMotion,
  className,
  state,
  onActivate,
  onDeactivate,
  children,
}: TechNodeCardProps) {
  if (reduceMotion) {
    return (
      <div
        className={className}
        data-testid={`stack-node-${node.id}`}
        data-state={state}
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
      aria-label={`${node.name} (${clusterNames[node.cluster]})`}
      onMouseEnter={() => onActivate(node.id)}
      onMouseLeave={onDeactivate}
      onFocus={() => onActivate(node.id)}
      onBlur={onDeactivate}
    >
      {children}
    </button>
  );
}

export function Stack() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeNodeId, setActiveNodeId] = useState<TechNodeId | null>(null);

  const adjacencyMap = useMemo(() => createAdjacencyMap(), []);

  const activeNode = reduceMotion ? null : activeNodeId;

  const nodeMap = useMemo(() => {
    return new Map(techNodes.map((node) => [node.id, node]));
  }, []);

  const hasActiveNode = activeNode !== null;
  const activeConnections =
    activeNode !== null ? adjacencyMap.get(activeNode) : undefined;

  const onActivateNode = (nodeId: TechNodeId) => {
    if (!reduceMotion) {
      setActiveNodeId(nodeId);
    }
  };

  const onDeactivateNode = () => {
    if (!reduceMotion) {
      setActiveNodeId(null);
    }
  };

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

        <motion.div
          className={cx(
            styles.constellationCanvas,
            reduceMotion ? styles.reducedMotion : styles.motionEnabled,
          )}
          variants={graphVariants}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.55, delay: 0.15, ease: 'easeOut' }
          }
        >
          <div className={styles.clusterLabelLayer} aria-hidden="true">
            {clusterLabels.map((clusterLabel) => {
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
            })}
          </div>

          <svg
            className={styles.connectionLayer}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-testid="stack-connections"
          >
            {techEdges.map(([from, to]) => {
              const source = nodeMap.get(from);
              const target = nodeMap.get(to);

              if (!source || !target) {
                return null;
              }

              let edgeState: EdgeState = 'idle';

              if (reduceMotion) {
                edgeState = 'static';
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
                  )}
                  data-testid={`stack-edge-${from}-${to}`}
                  data-state={edgeState}
                />
              );
            })}
          </svg>

          <ul
            className={styles.nodeList}
            role="list"
            aria-describedby="stack-constellation-description"
          >
            {techNodes.map((node) => {
              const floatX = Math.max(2.5, node.floatRangeX * 5);
              const floatY = Math.max(2.5, node.floatRangeY * 5);
              const floatDuration = 14 / node.floatSpeed;

              const nodeStyle = {
                '--node-x': `${node.x}%`,
                '--node-y': `${node.y}%`,
                '--float-x': `${floatX.toFixed(2)}px`,
                '--float-y': `${floatY.toFixed(2)}px`,
                '--float-duration': `${floatDuration.toFixed(2)}s`,
                '--float-delay': `${(-node.floatPhase).toFixed(2)}s`,
              } as CSSProperties;

              let nodeState: NodeState = 'idle';

              if (reduceMotion) {
                nodeState = 'static';
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
                    reduceMotion={reduceMotion}
                    className={cx(
                      styles.nodeCard,
                      clusterClassNames[node.cluster],
                      getProficiencyClassName(node.proficiency),
                      nodeState === 'active' && styles.nodeActive,
                      nodeState === 'connected' && styles.nodeConnected,
                      nodeState === 'muted' && styles.nodeMuted,
                    )}
                    state={nodeState}
                    onActivate={onActivateNode}
                    onDeactivate={onDeactivateNode}
                  >
                    <span className={styles.nodeIconWrap} aria-hidden="true">
                      <i
                        className={`${styles.nodeIcon} ${node.iconClassName}`}
                      />
                    </span>
                    <span className={styles.nodeName}>{node.name}</span>
                  </TechNodeCard>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
