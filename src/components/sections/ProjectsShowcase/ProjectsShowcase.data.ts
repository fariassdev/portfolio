import type { Project } from './ProjectsShowcase.types';

export const PROJECTS: Project[] = [
  {
    id: 'senda',
    title: 'Senda',
    description:
      'Real-time AI content generation platform. Built from 0→1 as sole backend engineer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    previewSrc: '/images/senda/senda.webm',
    side: 'right',
  },
  {
    id: 'couple-organizer',
    title: 'Couple Organizer',
    description:
      'Calendar and to-do web app for couples. Built from 0→1 as sole developer. Designed the entire distributed architecture: API gateway, async job queues, WebSocket streaming, multi-tenant data isolation.',
    previewSrc: '/images/senda/Senda_demo_overview.mp4',
    side: 'left',
  },
];
