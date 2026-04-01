export type Proficiency = 'Primary' | 'Secondary' | 'Learning';

export type TechCluster = 'backend' | 'data' | 'infrastructure';

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
}

export interface ClusterLabel {
  readonly cluster: TechCluster;
  readonly x: number;
  readonly y: number;
}

export const clusterNames: Readonly<Record<TechCluster, string>> = {
  backend: 'Backend',
  data: 'Data',
  infrastructure: 'Infrastructure',
};

export const clusterLabels: readonly ClusterLabel[] = [
  { cluster: 'backend', x: 12, y: 12 },
  { cluster: 'data', x: 62, y: 25 },
  { cluster: 'infrastructure', x: 25, y: 64 },
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
  },
  {
    id: 'python',
    name: 'Python',
    iconClassName: 'devicon-python-plain',
    cluster: 'backend',
    proficiency: 'Secondary',
    x: 15,
    y: 44,
    floatRangeX: 0.8,
    floatRangeY: 1.1,
    floatSpeed: 0.95,
    floatPhase: 2.8,
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
  },
  {
    id: 'aws',
    name: 'AWS',
    iconClassName: 'devicon-amazonwebservices-plain',
    cluster: 'infrastructure',
    proficiency: 'Secondary',
    x: 62,
    y: 87,
    floatRangeX: 1.2,
    floatRangeY: 1,
    floatSpeed: 1.1,
    floatPhase: 2.6,
  },
] as const satisfies readonly ConstellationNode[];

export type TechNodeId = (typeof techNodes)[number]['id'];

export const techEdges: readonly (readonly [TechNodeId, TechNodeId])[] = [
  ['typescript', 'nodejs'],
  ['nodejs', 'postgresql'],
  ['postgresql', 'redis'],
  ['nodejs', 'redis'],
  ['docker', 'kubernetes'],
  ['docker', 'terraform'],
  ['docker', 'aws'],
  ['python', 'postgresql'],
  ['python', 'redis'],
  ['terraform', 'aws'],
  ['postgresql', 'docker'],
  ['aws', 'kubernetes'],
];
