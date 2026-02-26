'use client';

import { Button } from '@/components/ui/Button';
import {
  HERO_NAME,
  HERO_TITLE,
  HERO_DESCRIPTION,
  ROLES,
} from './hero.constants';
import styles from './hero.module.css';
import { useTypewriter } from './use-typewriter';

export function Hero() {
  const { text, currentRole } = useTypewriter({ roles: ROLES });

  return (
    <section id="hero" className={styles.heroSection}>
      <div className={styles.heroContent}>
        <p className={styles.heroName}>{HERO_NAME}</p>

        <h1 className={styles.heroRole}>
          <span className="sr-only" aria-live="polite">
            {HERO_TITLE} &amp; {currentRole}
          </span>
          <span aria-hidden="true">
            <span className={styles.staticRole}>{HERO_TITLE}</span>
            <br />
            <span className={styles.staticRole}>{'& '}</span>
            <span className={styles.rotatingRole}>{text}</span>
            <span className={styles.cursor} />
          </span>
        </h1>

        <p className={styles.heroDescription}>{HERO_DESCRIPTION}</p>

        <div className={styles.buttonsContainer}>
          <Button variant="primary" href="#work" aria-label="Explore Work">
            → Explore Work
          </Button>
          <Button
            variant="secondary"
            href={'/cv.pdf'}
            download={true}
            aria-label="View Resume"
          >
            ↓ View Resume
          </Button>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span>Scroll</span>
        <div className={styles.arrow} />
      </div>
    </section>
  );
}
