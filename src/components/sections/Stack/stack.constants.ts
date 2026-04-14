export type Proficiency = 'Primary' | 'Secondary' | 'Learning';

export type TechCluster = 'backend' | 'data' | 'infrastructure';

export type StackNarrativeRow = 'own' | 'useful' | 'running';

export type BrickDurability = 1 | 2;

export interface ConstellationNode {
  readonly id: string;
  readonly name: string;
  readonly iconClassName: string;
  readonly cluster: TechCluster;
  readonly proficiency: Proficiency;
  readonly x: number;
  readonly y: number;
  readonly floatRangeX: number;
  readonly floatRangeY: number;
  readonly floatSpeed: number;
  readonly floatPhase: number;
  readonly errorSignature: string;
  readonly hitMessage: string;
  readonly deployStep: string;
  readonly narrativeRow: StackNarrativeRow;
  readonly brickDurability: BrickDurability;
  readonly brickSlot: number;
}

export interface ClusterLabel {
  readonly cluster: TechCluster;
  readonly x: number;
  readonly y: number;
}

export interface NarrativeRow {
  readonly id: StackNarrativeRow;
  readonly label: string;
  readonly slotStart: number;
  readonly slotEnd: number;
}

export const clusterNames: Readonly<Record<TechCluster, string>> = {
  backend: 'Backend',
  data: 'Data',
  infrastructure: 'Infrastructure',
};

export const clusterLabels: readonly ClusterLabel[] = [
  { cluster: 'backend', x: 22, y: 12 },
  { cluster: 'data', x: 71, y: 28 },
  { cluster: 'infrastructure', x: 29, y: 67 },
];

export const narrativeRows: readonly NarrativeRow[] = [
  { id: 'own', label: 'What I own', slotStart: 0, slotEnd: 2 },
  {
    id: 'useful',
    label: 'What makes it useful',
    slotStart: 3,
    slotEnd: 6,
  },
  {
    id: 'running',
    label: 'What keeps it running',
    slotStart: 7,
    slotEnd: 9,
  },
];

export const techNodes = [
  {
    id: 'typescript',
    name: 'TypeScript',
    iconClassName: 'devicon-typescript-plain',
    cluster: 'backend',
    proficiency: 'Primary',
    x: 16,
    y: 22,
    floatRangeX: 1,
    floatRangeY: 1.2,
    floatSpeed: 0.9,
    floatPhase: 0.2,
    errorSignature: 'TS2304',
    hitMessage: 'Cannot find name "DeployConfig".',
    deployStep: 'Compiling TypeScript...',
    narrativeRow: 'own',
    brickDurability: 2,
    brickSlot: 0,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    iconClassName: 'devicon-nodejs-plain',
    cluster: 'backend',
    proficiency: 'Primary',
    x: 28,
    y: 30,
    floatRangeX: 1.3,
    floatRangeY: 0.9,
    floatSpeed: 1.15,
    floatPhase: 1.4,
    errorSignature: 'ERR_MODULE_NOT_FOUND',
    hitMessage:
      'Cannot find package "queue-core" imported from /app/index.mjs.',
    deployStep: 'Starting Node.js server...',
    narrativeRow: 'own',
    brickDurability: 2,
    brickSlot: 1,
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    iconClassName: 'devicon-graphql-plain',
    cluster: 'backend',
    proficiency: 'Primary',
    x: 42,
    y: 21,
    floatRangeX: 0.85,
    floatRangeY: 1.05,
    floatSpeed: 1.02,
    floatPhase: 2.8,
    errorSignature: 'GRAPHQL_VALIDATION_FAILED',
    hitMessage: 'Unknown type "DeployStatus" in schema.graphql.',
    deployStep: 'Loading GraphQL schema...',
    narrativeRow: 'own',
    brickDurability: 2,
    brickSlot: 2,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    iconClassName: 'devicon-postgresql-plain',
    cluster: 'data',
    proficiency: 'Primary',
    x: 63,
    y: 40,
    floatRangeX: 1,
    floatRangeY: 1,
    floatSpeed: 1.05,
    floatPhase: 0.9,
    errorSignature: 'SQLSTATE[42P01]',
    hitMessage: 'relation "deploy_jobs" does not exist.',
    deployStep: 'Running PostgreSQL migrations...',
    narrativeRow: 'useful',
    brickDurability: 2,
    brickSlot: 3,
  },
  {
    id: 'redis',
    name: 'Redis',
    iconClassName: 'devicon-redis-plain',
    cluster: 'data',
    proficiency: 'Primary',
    x: 76,
    y: 48,
    floatRangeX: 1.1,
    floatRangeY: 0.8,
    floatSpeed: 1.25,
    floatPhase: 1.8,
    errorSignature: 'MISCONF',
    hitMessage:
      'Redis is configured to save RDB snapshots, but is currently unable to persist on disk.',
    deployStep: 'Warming Redis cache...',
    narrativeRow: 'useful',
    brickDurability: 2,
    brickSlot: 4,
  },
  {
    id: 'react',
    name: 'React',
    iconClassName: 'devicon-react-original',
    cluster: 'backend',
    proficiency: 'Secondary',
    x: 56,
    y: 48,
    floatRangeX: 1.05,
    floatRangeY: 0.95,
    floatSpeed: 1.12,
    floatPhase: 2.15,
    errorSignature: 'ERR_CHUNK_LOAD',
    hitMessage: 'Chunk "app-shell" failed to load after deploy swap.',
    deployStep: 'Building React bundle...',
    narrativeRow: 'useful',
    brickDurability: 2,
    brickSlot: 5,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    iconClassName: 'devicon-nextjs-plain',
    cluster: 'backend',
    proficiency: 'Secondary',
    x: 68,
    y: 58,
    floatRangeX: 1,
    floatRangeY: 0.9,
    floatSpeed: 1.08,
    floatPhase: 2.55,
    errorSignature: 'NEXT_BUILD_ERROR',
    hitMessage: 'Route "/stack" failed prerendering in production mode.',
    deployStep: 'Generating Next.js pages...',
    narrativeRow: 'useful',
    brickDurability: 2,
    brickSlot: 6,
  },
  {
    id: 'docker',
    name: 'Docker',
    iconClassName: 'devicon-docker-plain',
    cluster: 'infrastructure',
    proficiency: 'Primary',
    x: 36,
    y: 71,
    floatRangeX: 1.2,
    floatRangeY: 0.9,
    floatSpeed: 1,
    floatPhase: 0.4,
    errorSignature: 'failed to solve',
    hitMessage:
      'process "/bin/sh -c npm ci" did not complete successfully: exit code: 1.',
    deployStep: 'Building Docker image...',
    narrativeRow: 'running',
    brickDurability: 1,
    brickSlot: 7,
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    iconClassName: 'devicon-kubernetes-plain',
    cluster: 'infrastructure',
    proficiency: 'Primary',
    x: 49,
    y: 78,
    floatRangeX: 0.9,
    floatRangeY: 1.1,
    floatSpeed: 1.3,
    floatPhase: 2.2,
    errorSignature: 'CrashLoopBackOff',
    hitMessage: 'Back-off restarting failed container api.',
    deployStep: 'Rolling update to Kubernetes...',
    narrativeRow: 'running',
    brickDurability: 1,
    brickSlot: 8,
  },
  {
    id: 'terraform',
    name: 'Terraform',
    iconClassName: 'devicon-terraform-plain',
    cluster: 'infrastructure',
    proficiency: 'Secondary',
    x: 24,
    y: 88,
    floatRangeX: 1.1,
    floatRangeY: 0.9,
    floatSpeed: 0.85,
    floatPhase: 3.1,
    errorSignature: 'ReferenceError',
    hitMessage: 'Reference to undeclared resource "aws_lb.gateway".',
    deployStep: 'Applying Terraform plan...',
    narrativeRow: 'running',
    brickDurability: 1,
    brickSlot: 9,
  },
] as const satisfies readonly ConstellationNode[];

export type TechNodeId = (typeof techNodes)[number]['id'];

export interface DeployStep {
  readonly nodeId: TechNodeId;
  readonly label: string;
  readonly row: StackNarrativeRow;
}

export const deploySteps: readonly DeployStep[] = techNodes
  .slice()
  .sort((left, right) => left.brickSlot - right.brickSlot)
  .map((node) => ({
    nodeId: node.id,
    label: node.deployStep,
    row: node.narrativeRow,
  }));

export const techEdges: readonly (readonly [TechNodeId, TechNodeId])[] = [
  ['typescript', 'nodejs'],
  ['typescript', 'graphql'],
  ['nodejs', 'graphql'],
  ['nodejs', 'postgresql'],
  ['nodejs', 'redis'],
  ['graphql', 'react'],
  ['react', 'nextjs'],
  ['nextjs', 'docker'],
  ['docker', 'kubernetes'],
  ['docker', 'terraform'],
  ['postgresql', 'docker'],
  ['redis', 'docker'],
  ['terraform', 'kubernetes'],
];
