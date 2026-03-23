export type Proficiency = 'Primary' | 'Secondary' | 'Learning';

export interface Technology {
  readonly name: string;
  readonly icon: string;
  readonly proficiency: Proficiency;
}

export interface TechCategory {
  readonly name: string;
  readonly technologies: readonly Technology[];
}

export const categories: readonly TechCategory[] = [
  {
    name: 'Backend',
    technologies: [
      { name: 'TypeScript', icon: '🇹', proficiency: 'Primary' },
      { name: 'Node.js', icon: '🟢', proficiency: 'Primary' },
      { name: 'Go', icon: '🔗', proficiency: 'Primary' },
      { name: 'Rust', icon: '⚙️', proficiency: 'Secondary' },
    ],
  },
  {
    name: 'Data',
    technologies: [
      { name: 'PostgreSQL', icon: '🐘', proficiency: 'Primary' },
      { name: 'Redis', icon: '🔴', proficiency: 'Primary' },
      { name: 'Elasticsearch', icon: '🔍', proficiency: 'Secondary' },
      { name: 'ClickHouse', icon: '🏠', proficiency: 'Learning' },
    ],
  },
  {
    name: 'Infrastructure',
    technologies: [
      { name: 'Kubernetes', icon: '☸️', proficiency: 'Primary' },
      { name: 'Docker', icon: '🐳', proficiency: 'Primary' },
      { name: 'Terraform', icon: '🌿', proficiency: 'Secondary' },
      { name: 'AWS / GCP', icon: '☁️', proficiency: 'Secondary' },
    ],
  },
  {
    name: 'Frontend',
    technologies: [
      { name: 'Next.js', icon: '▲', proficiency: 'Primary' },
      { name: 'React', icon: '⚛️', proficiency: 'Primary' },
      { name: 'CSS Modules', icon: '🎨', proficiency: 'Primary' },
      { name: 'Three.js', icon: '🔺', proficiency: 'Secondary' },
    ],
  },
];
