import type { ExperienceCommit } from './About.types';

export const ABOUT_ME_BIO =
  'Since I was very young, I have been passionate about technology. At age 9, I wanted to understand how consoles worked internally, and by age 12, I was teaching myself to program my first games in LUA. My professional career is characterized by solving complex problems, optimizing high-performance architectures, and designing scalable cloud infrastructures, always with a strong focus on technical quality, observability, and a pragmatic, product-oriented mindset.';

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
      'Developed and optimized backend services for Waking Up, a leading meditation platform with 300K to 500K active users worldwide, serving millions globally.',
      "Led the critical migration of Making Sense's subscription and user system (from piano.io to a custom platform with Braintree), doubling monthly revenue from $500K to $1M while ensuring zero payment failures or duplicated accounts.",
      'Implemented comprehensive observability with Datadog, prevented N+1 query issues using DataLoaders, and optimized overall performance with Redis caching.',
      'Designed GraphQL APIs (Apollo Server) and RESTful services with an iterative-incremental product mindset, collaborating closely with product, design, data analytics, and mobile teams.',
      'Established CI/CD pipelines and maintained high code quality standards through unit and integration testing with Jest and Mocha.',
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
    role: 'B.S. in Computer Science Graduate',
    company: 'Universitat Oberta de Catalunya (UOC)',
    location: 'Spain (Online)',
    bulletPoints: [
      "Successfully completed a Bachelor's Degree in Computer Science while working full-time as a Backend Engineer on high-demand international projects.",
      'Developed "Senda" as a Final Degree Project: a guided meditation platform featuring generative AI (Google Gemini API), synthetic neural audio, and hexagonal architecture (FastAPI + React/Next.js), receiving Honors (Matrícula de Honor).',
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
      "Developed high-scale food delivery platforms for Burger King and Foster's Hollywood in Spain and Portugal using TypeScript (Node.js + Angular) and Java (Spring Framework) stacks.",
      'Designed and managed auto-scaling cloud infrastructure on AWS using IAM, EC2, Lambda, Fargate, RDS, DMS, DynamoDB, and API Gateway.',
      'Managed Infrastructure as Code (IaC) using Terraform, Docker, Vagrant, and Ansible in a cross-functional agile team with a T-shaped mindset.',
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
    company: 'Town Hall (Cáceres) / DAW Vocational Studies',
    location: 'Cáceres, Spain (On-site)',
    bulletPoints: [
      'Maintained local municipal network infrastructure, proxies, public access points, and unified environments on-site full-time.',
      'Completed a Higher Vocational Diploma in Web Application Development (DAW), receiving the Regional Extraordinary Prize for the highest academic performance in the region.',
      'Successfully balanced full-time studies and on-site work, developing strong self-discipline and problem-solving skills under pressure.',
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
      'feat(origins): reverse engineer game consoles and develop LUA game for PSP',
    role: 'Self-taught Developer & Scene Enthusiast',
    company: 'Sony PSP Scene Community',
    location: 'Cáceres, Spain',
    bulletPoints: [
      'Discovered programming entirely self-taught at age 12 with LUA, developing a fully functional homebrew game for the Sony PSP and designing its graphical interfaces in Photoshop.',
      'Reverse-engineered consoles (PSP, Xbox, Wii) at an early age to understand their hardware architecture, enable homebrew execution, and provide support in Spanish-speaking Scene forums.',
    ],
    technologies: [{ name: 'Git', iconClass: 'devicon-git-plain' }],
  },
];
