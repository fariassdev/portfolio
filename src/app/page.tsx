'use client';

import { About } from '@/components/sections/About';
import { Hero } from '@/components/sections/Hero';
import { ProjectsShowcase } from '@/components/sections/ProjectsShowcase';
import { ViewportOverlay } from '@/components/ui/ViewportOverlay';
import { ScrollTimelineProvider } from '@/context/ScrollTimelineContext';
import styles from './page.module.css';

export default function Home() {
  return (
    <ScrollTimelineProvider>
      <div className={styles.page}>
        {/* 3D WebGL / CRT Monitor fixed presentation layer */}
        <ViewportOverlay />

        {/* Fully decoupled semantic layout sections */}
        <Hero />
        <ProjectsShowcase />
        <About />
      </div>
    </ScrollTimelineProvider>
  );
}
