'use client';

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

        <section
          id="stack"
          style={{ minHeight: '100vh', width: '100%', padding: '100px 20px' }}
        >
          <h2>Stack Section</h2>
        </section>

        <section
          id="experience"
          style={{
            minHeight: '100vh',
            width: '100%',
            padding: '100px 20px',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <h2>Experience Section</h2>
        </section>

        <section
          id="contact"
          style={{ minHeight: '100vh', width: '100%', padding: '100px 20px' }}
        >
          <h2>Contact Section</h2>
        </section>
      </div>
    </ScrollTimelineProvider>
  );
}
