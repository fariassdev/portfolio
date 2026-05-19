import type { ExperienceCommit } from './About.types';

export const ABOUT_ME_BIO =
  'Driven by a strong curiosity for system internals and computing, I taught myself to program early on. Today, my professional career is characterized by solving complex backend challenges, optimizing high-performance APIs, and designing scalable cloud infrastructures. I approach software development with a strict focus on technical quality, deep observability, and a pragmatic, product-oriented mindset.';

export const EXPERIENCE_COMMITS: ExperienceCommit[] = [
  {
    hash: 'c4b8a192',
    date: '2021 - 2025',
    author: 'fariassdev <ferarias.santos@gmail.com>',
    tag: 'v2.0.0-HEAD',
    type: 'feat',
    message:
      'feat(experience): optimize high-volume APIs & migrate subscription backend',
    role: 'Senior Backend Developer',
    company: 'Z1 Digital Studio → Five Koalas (spin-off)',
    location: 'Seville, Spain (Remote)',
    bulletPoints: [
      'Led the critical backend migration of Making Sense billing system, doubling monthly subscription revenue from $500K to $1M with zero downtime.',
      'Optimized GraphQL and REST APIs serving 500K active users for Waking Up using Redis caching and DataLoader pattern.',
      'Established Datadog observability pipelines, comprehensive Jest testing, and high-performance CI/CD workflows.',
    ],
    technologies: [
      { name: 'Node.js', iconClass: 'devicon-nodejs-plain' },
      { name: 'Express', iconClass: 'devicon-express-original' },
      { name: 'TypeScript', iconClass: 'devicon-typescript-plain' },
      { name: 'GraphQL', iconClass: 'devicon-graphql-plain' },
      { name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain' },
      { name: 'Redis', iconClass: 'devicon-redis-plain' },
      { name: 'AWS', iconClass: 'devicon-amazonwebservices-original' },
      { name: 'Docker', iconClass: 'devicon-docker-plain' },
      { name: 'Kubernetes', iconClass: 'devicon-kubernetes-plain' },
    ],
  },
  {
    hash: 'e2b4d9a1',
    date: '2020 - 2026',
    author: 'fariassdev <ferarias.santos@gmail.com>',
    tag: 'v1.5.0',
    type: 'docs',
    message: "docs(education): complete Bachelor's Degree in Computer Science",
    role: 'B.S. in Computer Science Student',
    company: 'Universitat Oberta de Catalunya (UOC)',
    location: 'Spain (Online)',
    bulletPoints: [
      "Balancing a full-time senior engineering role while completing a Bachelor's Degree in Computer Science.",
      'Developed "Senda" (TFG): AI-guided meditation platform with FastAPI and Next.js, powered by Google Gemini API and KokoroTTS, receiving Honors.',
    ],
    technologies: [
      { name: 'Python', iconClass: 'devicon-python-plain' },
      { name: 'FastAPI', iconClass: 'devicon-fastapi-plain' },
      { name: 'Next.js', iconClass: 'devicon-nextjs-plain' },
      { name: 'React', iconClass: 'devicon-react-original' },
      { name: 'Git', iconClass: 'devicon-git-plain' },
    ],
  },
  {
    hash: 'a8f9e038',
    date: '2016 - 2020',
    author: 'fariassdev <ferarias.santos@gmail.com>',
    tag: 'v1.0.0',
    type: 'feat',
    message:
      "feat(experience): scale delivery platforms for Foster's Hollywood & Burger King",
    role: 'Full-Stack Developer (DevOps & Backend)',
    company: 'Homeria Open Solutions',
    location: 'Spain (Hybrid)',
    bulletPoints: [
      "Architected food delivery APIs for Burger King and Foster's Hollywood in Spain and Portugal using Node.js, Spring Framework, and Angular.",
      'Designed self-scaling AWS cloud infrastructure using Terraform IaC, Fargate, Lambda, and DynamoDB.',
      'Streamlined development cycles by introducing standardized Docker and Ansible environments.',
    ],
    technologies: [
      { name: 'TypeScript', iconClass: 'devicon-typescript-plain' },
      { name: 'Node.js', iconClass: 'devicon-nodejs-plain' },
      { name: 'Angular', iconClass: 'devicon-angularjs-plain' },
      { name: 'AWS', iconClass: 'devicon-amazonwebservices-original' },
      { name: 'Terraform', iconClass: 'devicon-terraform-plain' },
      { name: 'Docker', iconClass: 'devicon-docker-plain' },
      { name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain' },
    ],
  },
  {
    hash: 'd3c4e12a',
    date: '2015 - 2016',
    author: 'fariassdev <ferarias.santos@gmail.com>',
    tag: 'v0.2.0-beta',
    type: 'build',
    message:
      'build(academics): obtain Higher Vocational Diploma & work as network technician',
    role: 'Network & Systems Technician / DAW Graduate',
    company: 'Town Hall (Cáceres) / Vocational Studies',
    location: 'Cáceres, Spain (On-site)',
    bulletPoints: [
      'Maintained municipal servers, networks, public proxies, and active directory systems full-time.',
      'Graduated DAW with the Regional Extraordinary Prize (highest academic performance in the region).',
    ],
    technologies: [
      { name: 'Git', iconClass: 'devicon-git-plain' },
      { name: 'JavaScript', iconClass: 'devicon-javascript-plain' },
      { name: 'HTML5', iconClass: 'devicon-html5-plain' },
      { name: 'CSS3', iconClass: 'devicon-css3-plain' },
    ],
  },
  {
    hash: '7b2a901e',
    date: '2009 - 2015',
    author: 'fariassdev <ferarias.santos@gmail.com>',
    tag: 'v0.1.0-alpha',
    type: 'feat',
    message:
      'feat(origins): early self-taught programming and system fundamentals',
    role: 'Self-Taught Systems Exploration',
    company: 'Open Source & System Exploration',
    location: 'Cáceres, Spain',
    bulletPoints: [
      'Began self-taught exploration of programming concepts, learning system scripting and software modification.',
      'Acquired early knowledge of system architectures, compiler basics, and system internals by experimenting with hardware firmware.',
    ],
    technologies: [{ name: 'Git', iconClass: 'devicon-git-plain' }],
  },
];
