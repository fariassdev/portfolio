import type { Project } from './ProjectsShowcase.types';

export const PROJECTS: Project[] = [
  {
    id: 'senda',
    title: 'Senda',
    description:
      'AI-powered guided meditation platform featuring LLM-based generative script creation (Google Gemini API), neural audio synthesis (KokoroTTS), and prompt engineering for structured content generation. Built with hexagonal architecture (FastAPI) and React/Next.js CMS. Final Degree Project receiving Honors with maximum grade.',
    previewSrc: '/videos/senda_demo.webm',
    side: 'right',
    githubUrl: 'https://github.com/fariassdev/senda',
    liveUrl: 'https://senda-cms.vercel.app?ref=fernandoas.com',
    technologies: [
      { name: 'FastAPI', iconClass: 'devicon-fastapi-plain' },
      { name: 'Python', iconClass: 'devicon-python-plain' },
      { name: 'Next.js', iconClass: 'devicon-nextjs-plain' },
      { name: 'React', iconClass: 'devicon-react-original' },
    ],
  },
  {
    id: 'twodo',
    title: 'Twodo',
    description:
      'Side project started for fun and evolved as a household coordination platform for couples to manage tasks, expenses, and shopping lists collaboratively. Mobile-first React 19 app with Supabase backend, real-time sync, and offline-first capabilities using TanStack Query and IndexedDB.',
    previewSrc: '/videos/twodo_demo.webm',
    side: 'left',
    githubUrl: 'https://github.com/fariassdev/twodo-web',
    liveUrl: 'https://twodo.co?ref=fernandoas.com',
    technologies: [
      { name: 'Node.js', iconClass: 'devicon-nodejs-plain' },
      { name: 'TypeScript', iconClass: 'devicon-typescript-plain' },
      { name: 'React', iconClass: 'devicon-react-original' },
      { name: 'Supabase', iconClass: 'devicon-supabase-plain' },
    ],
  },
];
