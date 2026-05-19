'use client';

import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import {
  TOTAL_SPACER_HEIGHT,
  TITLE_ENTRANCE_END,
  TITLE_EXIT_START,
  TITLE_EXIT_END,
  LAYOUT_TIMING_OPACITY,
  SCROLL_HINT_TIMING,
} from './About.constants';
import styles from './About.module.css';

export function About() {
  const { aboutRef, aboutProgress } = useScrollTimeline();
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);
  const [copied, setCopied] = useState(false);

  // Title transitions (Stage 1)
  const titleOpacity = useTransform(
    aboutProgress,
    [0, TITLE_ENTRANCE_END * 0.7, TITLE_EXIT_START, TITLE_EXIT_END],
    [0, 1, 1, 0],
  );

  const titleY = useTransform(
    aboutProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_START, TITLE_EXIT_END],
    [80, 0, 0, -240],
  );

  const titleScale = useTransform(
    aboutProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [0.85, 1.0, 1.05],
  );

  const scrollHintOpacity = useTransform(
    aboutProgress,
    SCROLL_HINT_TIMING,
    [0, 0, 1, 1, 0],
  );

  // Layout Container Transition (Stage 2)
  const layoutOpacity = useTransform(
    aboutProgress,
    LAYOUT_TIMING_OPACITY,
    [0, 1],
  );

  const layoutY = useTransform(aboutProgress, LAYOUT_TIMING_OPACITY, [120, 0]);
  const layoutScale = useTransform(
    aboutProgress,
    LAYOUT_TIMING_OPACITY,
    [0.92, 1],
  );

  // Handle title animation state
  useMotionValueEvent(aboutProgress, 'change', (progress) => {
    if (progress > 0.01) {
      if (!shouldAnimateTitle) setShouldAnimateTitle(true);
    } else if (shouldAnimateTitle) {
      setShouldAnimateTitle(false);
    }
  });

  // Modern, tactile glow effect on card hover
  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
  ) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('ferarias.santos@gmail.com');
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [copied]);

  const techStack = [
    { name: 'Node.js', iconClass: 'devicon-nodejs-plain' },
    { name: 'TypeScript', iconClass: 'devicon-typescript-plain' },
    { name: 'GraphQL', iconClass: 'devicon-graphql-plain' },
    { name: 'PostgreSQL', iconClass: 'devicon-postgresql-plain' },
    { name: 'Redis', iconClass: 'devicon-redis-plain' },
    {
      name: 'AWS Cloud',
      iconClass: 'devicon-amazonwebservices-plain-wordmark',
    },
    { name: 'Python', iconClass: 'devicon-python-plain' },
    { name: 'Next.js', iconClass: 'devicon-nextjs-plain' },
    { name: 'Docker', iconClass: 'devicon-docker-plain' },
    { name: 'Kubernetes', iconClass: 'devicon-kubernetes-plain' },
    { name: 'Git', iconClass: 'devicon-git-plain' },
  ];

  const renderContactSection = () => (
    <div className={styles.contactSection}>
      <div className={styles.contactGrid}>
        {/* GitHub */}
        <a
          href="https://github.com/fariassdev"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactCard}
          onMouseMove={handleMouseMove}
          aria-label="GitHub Profile"
        >
          <div className={styles.contactIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div className={styles.contactDetails}>
            <span className={styles.contactLabel}>GitHub</span>
            <span className={styles.contactValue}>github.com/fariassdev</span>
          </div>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/fernando-arias-santos-5a49a010b/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactCard}
          onMouseMove={handleMouseMove}
          aria-label="LinkedIn Profile"
        >
          <div className={styles.contactIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
          <div className={styles.contactDetails}>
            <span className={styles.contactLabel}>LinkedIn</span>
            <span className={styles.contactValue}>fernando-arias-santos</span>
          </div>
        </a>

        {/* Email Card (Copies to clipboard) */}
        <div
          role="button"
          tabIndex={0}
          className={styles.contactCard}
          onMouseMove={handleMouseMove}
          onClick={handleCopyEmail}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCopyEmail(e as unknown as React.MouseEvent);
            }
          }}
          aria-label="Copy Email to Clipboard"
        >
          <div className={styles.contactIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className={styles.contactDetails}>
            <span className={styles.contactLabel}>Email</span>
            {copied ? (
              <span className={styles.copySuccess}>Copied!</span>
            ) : (
              <span className={styles.contactValue}>
                ferarias.santos@gmail.com
              </span>
            )}
          </div>
        </div>

        {/* CV / Resume */}
        <a
          href="/Resume_Fernando_Arias_Santos.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactCard}
          onMouseMove={handleMouseMove}
          aria-label="Download CV Resume"
        >
          <div className={styles.contactIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className={styles.contactDetails}>
            <span className={styles.contactLabel}>Resume</span>
            <span className={styles.contactValue}>resume.pdf</span>
          </div>
        </a>
      </div>
    </div>
  );

  return (
    <section id="about" className={styles.section} aria-label="About Me">
      <div
        ref={aboutRef}
        className={styles.scrollSpacer}
        style={{ height: `${TOTAL_SPACER_HEIGHT}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.contentContainer}>
            {/* Title Overlay (Stage 1) */}
            <motion.div
              className={styles.titleWrapper}
              style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            >
              <div className={styles.titleBackground}>
                SYSTEM_INDEX: ABOUT_ME // SECURE_ACCESS
              </div>
              <div className={styles.titleLabel}>
                <DecryptText
                  text="Who I Am"
                  shouldAnimate={shouldAnimateTitle}
                />
              </div>
              <SweepText
                as="h2"
                text="About Me"
                className={styles.aboutTitle}
                shouldAnimate={shouldAnimateTitle}
              />
            </motion.div>

            {/* Scroll Hint */}
            <ScrollHint
              opacity={scrollHintOpacity}
              className={styles.scrollHintDesktopOnly}
            />

            {/* Editorial Sticky Layout (Stage 2) */}
            <motion.div
              className={styles.editorialLayout}
              style={{ opacity: layoutOpacity, y: layoutY, scale: layoutScale }}
            >
              {/* Sidebar Column (Left) */}
              <div className={styles.sidebarColumn}>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  STATUS: ACTIVE // SPAIN
                </div>

                <div className={styles.profileCard}>
                  <h3 className={styles.profileRole}>
                    Senior Software
                    <br />
                    Developer
                  </h3>
                </div>

                <div className={styles.techStackSection}>
                  <h4 className={styles.techStackTitle}>Core Expertise</h4>
                  <div className={styles.techStackGrid}>
                    {techStack.map((tech) => (
                      <span key={tech.name} className={styles.techPill}>
                        <i
                          className={`${tech.iconClass} colored`}
                          aria-hidden="true"
                        />
                        <span className={styles.techName}>{tech.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Desktop-only Contact cards */}
                <div className={styles.desktopContactWrapper}>
                  {renderContactSection()}
                </div>
              </div>

              {/* Story Column (Right) */}
              <div className={styles.storyColumn}>
                <div className={styles.storyText}>
                  <p className={styles.paragraph}>
                    I started my coding journey as a curious self-taught kid
                    hacking gaming consoles, later transitioning into
                    professional{' '}
                    <span className={styles.accentWord}>
                      backend engineering
                    </span>
                    . Since then, I’ve built high-performance APIs and robust
                    cloud architectures, collaborating with multidisciplinary
                    teams and scaling systems that serve over{' '}
                    <span className={styles.boldWord}>
                      half a million active users
                    </span>
                    .
                  </p>
                  <p className={styles.paragraph}>
                    A{' '}
                    <span className={styles.boldWord}>
                      self-learner at heart
                    </span>
                    , I thrive on mastering system internals and staying ahead
                    of engineering practices. My background in computer science
                    helps me tackle complex backend migrations and system
                    optimizations with clarity and efficiency, ensuring high
                    code quality under pressure.
                  </p>
                  <p className={styles.paragraph}>
                    Outside of work, I enjoy practicing all kinds of sports,
                    traveling, and hanging out with friends. I&apos;m also
                    deeply fascinated by the latest{' '}
                    <span className={styles.accentWord}>AI advancements</span>{' '}
                    and constantly experimenting with integrations in the
                    emerging AI ecosystem.
                  </p>
                </div>

                {/* Mobile-only Contact cards */}
                <div className={styles.mobileContactWrapper}>
                  {renderContactSection()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Extra scroll breathing room to allow the sticky viewport to unpin and scroll up, revealing the tactile contact cards */}
      <div className={styles.bottomRevealSpacer} />
    </section>
  );
}
