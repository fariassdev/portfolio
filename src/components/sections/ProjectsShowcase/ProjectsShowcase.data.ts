import type { Project } from './ProjectsShowcase.types';

export const PROJECTS: Project[] = [
  {
    id: 'senda',
    title: 'Senda',
    description:
      'AI-powered meditation platform designed to generate automated guided courses. Orchestrates Google Gemini for script synthesis and KokoroTTS for audio production via a FastAPI backend. Features a Next.js CMS and a persistent virtual guide architecture for structured content delivery.',
    previewSrc: '/images/senda/senda.webm',
    side: 'right',
  },
  {
    id: 'twodo',
    title: 'Twodo',
    description:
      'Household coordination platform for couples designed to reduce mental load through shared task management and expense tracking. Features a mobile-first interface with collaborative shopping lists and real-time balance metrics. Engineered with React 19, Supabase, and TanStack Query, implementing robust offline persistence via IndexedDB.',
    previewSrc: '/images/senda/Senda_demo_overview.mp4',
    side: 'left',
  },
];
