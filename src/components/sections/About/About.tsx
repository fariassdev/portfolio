'use client';

import {
  motion,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import { useState } from 'react';
import { DecryptText } from '@/components/ui/DecryptText/decrypt-text';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { SweepText } from '@/components/ui/SweepText/sweep-text';
import { useScrollTimeline } from '@/context/ScrollTimelineContext';
import { SCROLL_PAGES, COMMIT_PHASES } from './About.constants';
import { EXPERIENCE_COMMITS, ABOUT_ME_BIO } from './About.data';
import styles from './About.module.css';

export function About() {
  const { experienceRef, experienceProgress } = useScrollTimeline();
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);
  const [activeCommitIndex, setActiveCommitIndex] = useState(0);

  const totalSpacerHeight = SCROLL_PAGES * 100;

  // Title Entrance and Exit boundaries (symmetrical to Projects title)
  const TITLE_ENTRANCE_END = 0.05;
  const TITLE_EXIT_START = 0.12;
  const TITLE_EXIT_END = 0.18;

  // Title Animations mapping
  const titleOpacity = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END * 0.7, TITLE_EXIT_START, TITLE_EXIT_END],
    [0, 1, 1, 0],
  );

  const titleY = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_START, TITLE_EXIT_END],
    [80, 0, 0, -240],
  );

  const titleScale = useTransform(
    experienceProgress,
    [0, TITLE_ENTRANCE_END, TITLE_EXIT_END],
    [0.55, 1.0, 1.05],
  );

  const scrollHintOpacity = useTransform(
    experienceProgress,
    [
      0,
      TITLE_ENTRANCE_END * 0.4,
      TITLE_ENTRANCE_END,
      TITLE_EXIT_START * 0.5,
      TITLE_EXIT_START,
    ],
    [0, 0, 1, 1, 0],
  );

  // Split-Screen Presentation Layer animations
  const presentationOpacity = useTransform(
    experienceProgress,
    [TITLE_EXIT_START, TITLE_EXIT_END, 0.95, 0.99],
    [0, 1, 1, 0],
  );

  const presentationY = useTransform(
    experienceProgress,
    [TITLE_EXIT_START, TITLE_EXIT_END],
    [40, 0],
  );

  // Dynamic Neon Line growth animation
  const trunkHeight = useTransform(
    experienceProgress,
    [0.2, 0.92],
    ['0%', '100%'],
  );

  // Handle active commit calculations and title reveal state
  useMotionValueEvent(experienceProgress, 'change', (progress) => {
    if (progress > 0.01) {
      if (!shouldAnimateTitle) setShouldAnimateTitle(true);
    } else if (shouldAnimateTitle) {
      setShouldAnimateTitle(false);
    }

    // Determine active commit index based on current scroll progress
    let nextIndex = 0;
    if (progress >= 0.84) nextIndex = 4;
    else if (progress >= 0.68) nextIndex = 3;
    else if (progress >= 0.52) nextIndex = 2;
    else if (progress >= 0.36) nextIndex = 1;
    else nextIndex = 0;

    if (nextIndex !== activeCommitIndex) {
      setActiveCommitIndex(nextIndex);
    }
  });

  // Scroll to node midpoint coordinates on click
  const handleNodeClick = (index: number) => {
    if (!experienceRef.current) return;
    const element = experienceRef.current;
    const offsetTop = element.offsetTop;
    const totalScrollable = element.clientHeight - window.innerHeight;

    // Find the midpoint of the scroll phase for the clicked index
    const phase = COMMIT_PHASES[index]!;
    const targetProgress = phase.min + (phase.max - phase.min) / 2;
    const targetScrollY = offsetTop + totalScrollable * targetProgress;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  const activeCommit = EXPERIENCE_COMMITS[activeCommitIndex]!;

  return (
    <section
      id="experience"
      className={styles.section}
      aria-label="About and Experience"
    >
      <div
        ref={experienceRef}
        className={styles.scrollSpacer}
        style={{ height: `${totalSpacerHeight}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.contentContainer}>
            {/* Title Overlay */}
            <motion.div
              className={styles.titleWrapper}
              style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            >
              <div className={styles.titleBackground}>
                COMMIT_LOG: ACTIVE // BRANCH: MAIN
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
            <ScrollHint opacity={scrollHintOpacity} />

            {/* Desktop Presentation Layer */}
            <motion.div
              className={styles.presentationLayer}
              style={{ opacity: presentationOpacity, y: presentationY }}
            >
              {/* Left Panel: Git Graph Timeline */}
              <div className={styles.gitGraphPanel}>
                <div className={styles.profileBio}>{ABOUT_ME_BIO}</div>
                <div className={styles.gitTreeWrapper}>
                  {/* Vertical Trunk Line */}
                  <div className={styles.gitLinesContainer}>
                    <div className={styles.gitLineTrunkMuted} />
                    <motion.div
                      className={styles.gitLineTrunkActive}
                      style={{ height: trunkHeight }}
                    />
                  </div>

                  {/* Git Commit Nodes */}
                  {EXPERIENCE_COMMITS.map((commit, index) => {
                    const phase = COMMIT_PHASES[index]!;
                    // Dot is lit if scroll has passed the milestone threshold
                    const isLit = experienceProgress.get() >= phase.min;
                    const isFocused = activeCommitIndex === index;

                    return (
                      <div
                        key={commit.hash}
                        className={styles.gitNode}
                        onClick={() => handleNodeClick(index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View experience at ${commit.company}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNodeClick(index);
                          }
                        }}
                      >
                        <div className={styles.gitNodeDotWrapper}>
                          {isFocused && (
                            <motion.div
                              layoutId="about-node-pulse"
                              className={styles.gitNodePulse}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                              }}
                            />
                          )}
                          <div
                            className={`${styles.gitNodeDot} ${isLit ? styles.gitNodeDotActive : ''}`}
                          />
                        </div>

                        <div className={styles.gitNodeDetails}>
                          <span
                            className={`${styles.gitNodeMeta} ${isLit ? styles.gitNodeMetaActive : ''}`}
                          >
                            <span
                              className={`${styles.gitNodeHash} ${isLit ? styles.gitNodeHashActive : ''}`}
                            >
                              {commit.hash}
                            </span>
                            <span>•</span>
                            <span>{commit.date}</span>
                            {commit.tag && (
                              <span className={styles.gitNodeTag}>
                                {commit.tag}
                              </span>
                            )}
                          </span>
                          <span
                            className={`${styles.gitNodeMsg} ${isFocused ? styles.gitNodeMsgActive : ''}`}
                          >
                            {commit.message}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Terminal Commit Diff Inspector */}
              <div className={styles.inspectorPanel}>
                <div
                  className={`${styles.terminalWindow} ${
                    experienceProgress.get() >= 0.2
                      ? styles.terminalWindowActive
                      : ''
                  }`}
                >
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalControls}>
                      <div
                        className={`${styles.terminalDot} ${styles.terminalDotClose}`}
                      />
                      <div
                        className={`${styles.terminalDot} ${styles.terminalDotMinimize}`}
                      />
                      <div
                        className={`${styles.terminalDot} ${styles.terminalDotMaximize}`}
                      />
                    </div>
                    <div className={styles.terminalTitle}>
                      git-commit-inspector -- {activeCommit.hash}
                    </div>
                    <div className={styles.terminalShellName}>zsh</div>
                  </div>

                  <div className={styles.terminalContent}>
                    {/* Active Commit Diff */}
                    <div className={styles.cliCommand}>
                      <span className={styles.cliPromptUser}>fariassdev</span>
                      <span className={styles.cliPromptSign}>:~$</span>
                      <span className={styles.cliText}>
                        git show {activeCommit.hash}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCommit.hash}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className={styles.commitMetaBlock}>
                          <div className={styles.commitLineMeta}>
                            <span className={styles.metaLabel}>commit</span>
                            <span className={styles.metaValueHash}>
                              {activeCommit.hash}
                              {activeCommit.tag && (
                                <span className={styles.metaValueTag}>
                                  {' '}
                                  (tag: {activeCommit.tag})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className={styles.commitLineMeta}>
                            <span className={styles.metaLabel}>Author:</span>
                            <span className={styles.metaValue}>
                              {activeCommit.author}
                            </span>
                          </div>
                          <div className={styles.commitLineMeta}>
                            <span className={styles.metaLabel}>Date:</span>
                            <span className={styles.metaValue}>
                              {activeCommit.date}
                            </span>
                          </div>
                          <div
                            className={styles.commitLineMeta}
                            style={{ marginTop: '12px' }}
                          >
                            <span className={styles.metaLabel}>Msg:</span>
                            <span
                              className={styles.metaValue}
                              style={{ color: '#ffbd2e', fontWeight: 600 }}
                            >
                              {activeCommit.message}
                            </span>
                          </div>
                        </div>

                        <div
                          className={styles.diffHeader}
                          style={{ marginBottom: '12px' }}
                        >
                          diff --git a/career/experience b/career/experience
                        </div>

                        <div className={styles.diffLineAdd}>
                          + [Role] {activeCommit.role}
                        </div>
                        <div className={styles.diffLineAdd}>
                          + [Company] {activeCommit.company}
                        </div>
                        <div className={styles.diffLineAdd}>
                          + [Location] {activeCommit.location}
                        </div>
                        <div className={styles.diffLineNormal}> </div>

                        {activeCommit.bulletPoints.map((bullet, i) => (
                          <div key={i} className={styles.diffLineAdd}>
                            + {bullet}
                          </div>
                        ))}

                        {/* Technologies Tags */}
                        {activeCommit.technologies &&
                          activeCommit.technologies.length > 0 && (
                            <div className={styles.techStackBlock}>
                              {activeCommit.technologies.map((tech) => (
                                <span
                                  key={tech.name}
                                  className={styles.techTag}
                                >
                                  {tech.iconClass && (
                                    <i
                                      className={`${tech.iconClass} colored`}
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span>{tech.name}</span>
                                </span>
                              ))}
                            </div>
                          )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile / Fallback Layout (Stacked) */}
            <div className={styles.mobileLayout}>
              {/* Profile Copy */}
              <div className={styles.mobileBioCard}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-accent)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {'// Professional Profile'}
                </div>
                {ABOUT_ME_BIO}
              </div>

              {/* Mobile Timeline */}
              <div className={styles.mobileTimeline}>
                <div className={styles.mobileTimelineLine} />

                {EXPERIENCE_COMMITS.map((commit) => (
                  <div key={commit.hash} className={styles.mobileCommitCard}>
                    <div className={styles.mobileCommitDot} />

                    <div className={styles.mobileCommitHeader}>
                      <div className={styles.mobileHashTagRow}>
                        <span className={styles.mobileHash}>
                          commit {commit.hash}
                        </span>
                        {commit.tag && (
                          <span className={styles.mobileTag}>{commit.tag}</span>
                        )}
                      </div>
                      <h3 className={styles.mobileRole}>{commit.role}</h3>
                      <div className={styles.mobileMetaInfo}>
                        <strong>{commit.company}</strong> | {commit.location} (
                        {commit.date})
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: '#ffbd2e',
                          marginTop: '6px',
                        }}
                      >
                        {commit.message}
                      </div>
                    </div>

                    <ul className={styles.mobileBulletList}>
                      {commit.bulletPoints.map((bullet, i) => (
                        <li key={i} className={styles.mobileBulletPoint}>
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {commit.technologies && commit.technologies.length > 0 && (
                      <div className={styles.mobileTechStack}>
                        {commit.technologies.map((tech) => (
                          <span
                            key={tech.name}
                            className={styles.mobileTechTag}
                          >
                            {tech.iconClass && (
                              <i
                                className={`${tech.iconClass} colored`}
                                aria-hidden="true"
                              />
                            )}
                            <span>{tech.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
