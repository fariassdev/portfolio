import { Hero } from '@/components/sections/Hero';
import { Stack } from '@/components/sections/Stack';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <Hero />
      <section
        id="projects"
        style={{
          minHeight: '100vh',
          width: '100%',
          padding: '100px 20px',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <h2>Projects Section</h2>
      </section>
      <Stack />
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
  );
}
