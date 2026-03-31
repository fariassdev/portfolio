export type Proficiency = 'Primary' | 'Secondary' | 'Learning';

export interface Technology {
  readonly name: string;
  readonly iconClassName: string;
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
      {
        name: 'TypeScript',
        iconClassName: 'devicon-typescript-plain',
        proficiency: 'Primary',
      },
      {
        name: 'Node.js',
        iconClassName: 'devicon-nodejs-plain',
        proficiency: 'Primary',
      },
      {
        name: 'Python',
        iconClassName: 'devicon-python-plain',
        proficiency: 'Secondary',
      },
    ],
  },
  {
    name: 'Data',
    technologies: [
      {
        name: 'PostgreSQL',
        iconClassName: 'devicon-postgresql-plain',
        proficiency: 'Primary',
      },
      {
        name: 'Redis',
        iconClassName: 'devicon-redis-plain',
        proficiency: 'Primary',
      },
    ],
  },
  {
    name: 'Infrastructure',
    technologies: [
      {
        name: 'Kubernetes',
        iconClassName: 'devicon-kubernetes-plain',
        proficiency: 'Primary',
      },
      {
        name: 'Docker',
        iconClassName: 'devicon-docker-plain',
        proficiency: 'Primary',
      },
      {
        name: 'Terraform',
        iconClassName: 'devicon-terraform-plain',
        proficiency: 'Secondary',
      },
      {
        name: 'AWS',
        iconClassName: 'devicon-amazonwebservices-plain',
        proficiency: 'Secondary',
      },
    ],
  },
  {
    name: 'Frontend',
    technologies: [
      {
        name: 'Next.js',
        iconClassName: 'devicon-nextjs-plain',
        proficiency: 'Primary',
      },
      {
        name: 'React',
        iconClassName: 'devicon-react-original',
        proficiency: 'Primary',
      },
      {
        name: 'CSS',
        iconClassName: 'devicon-css3-plain',
        proficiency: 'Primary',
      },
    ],
  },
];
