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

  // Biography Showcase Layer animations (Stage 2)
  const bioOpacity = useTransform(
    experienceProgress,
    [0.18, 0.23, 0.33, 0.38],
    [0, 1, 1, 0],
  );

  const bioY = useTransform(
    experienceProgress,
    [0.18, 0.23, 0.33, 0.38],
    [40, 0, 0, -40],
  );

  const bioScale = useTransform(
    experienceProgress,
    [0.18, 0.23, 0.33, 0.38],
    [0.95, 1, 1, 1.02],
  );

  // Split-Screen Presentation Layer animations (Stage 3)
  const presentationOpacity = useTransform(
    experienceProgress,
    [0.38, 0.44, 0.95, 0.99],
    [0, 1, 1, 0],
  );

  const presentationY = useTransform(experienceProgress, [0.38, 0.44], [40, 0]);

  // Dynamic Neon Line growth animation
  const trunkHeight = useTransform(
    experienceProgress,
    [0.38, 0.92],
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
    let nextIndex = -1;
    if (progress >= 0.86) nextIndex = 4;
    else if (progress >= 0.74) nextIndex = 3;
    else if (progress >= 0.62) nextIndex = 2;
    else if (progress >= 0.5) nextIndex = 1;
    else if (progress >= 0.38) nextIndex = 0;
    else nextIndex = -1;

    if (nextIndex !== -1 && nextIndex !== activeCommitIndex) {
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

            {/* Bio Showcase Layer (Stage 2) */}
            <motion.div
              className={styles.bioOverlay}
              style={{ opacity: bioOpacity, y: bioY, scale: bioScale }}
            >
              <div className={styles.ideWindow}>
                <div className={styles.ideHeader}>
                  <div className={styles.ideControls}>
                    <span
                      className={`${styles.ideDot} ${styles.ideDotClose}`}
                    />
                    <span
                      className={`${styles.ideDot} ${styles.ideDotMinimize}`}
                    />
                    <span
                      className={`${styles.ideDot} ${styles.ideDotMaximize}`}
                    />
                  </div>
                  <div className={styles.ideTab}>
                    <span className={styles.ideTabIcon}>TS</span>
                    <span className={styles.ideTabName}>profile.ts</span>
                  </div>
                  <div style={{ width: '48px', opacity: 0 }} />
                </div>
                <div className={styles.ideBody}>
                  <div className={styles.ideLineNumbers}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={styles.ideLineNumber}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <pre className={styles.ideCode}>
                    <code>
                      <span className={styles.keyword}>import</span> {'{'}{' '}
                      <span className={styles.type}>Developer</span> {'}'}{' '}
                      <span className={styles.keyword}>from</span>{' '}
                      <span className={styles.string}>{"'fariassdev'"}</span>;
                      <br />
                      <br />
                      <span className={styles.comment}>
                        {
                          '// A self-taught backend engineer driven by system internals and scale'
                        }
                      </span>
                      <br />
                      <span className={styles.keyword}>export const</span>{' '}
                      <span className={styles.variable}>farias</span>:{' '}
                      <span className={styles.type}>Developer</span> = {'{'}
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.property}>origins</span>:{' '}
                      <span className={styles.string}>
                        {"'Self-taught programming & systems scripting'"}
                      </span>
                      ,<br />
                      &nbsp;&nbsp;<span className={styles.property}>focus</span>
                      : [<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.string}>
                        {'Observability'}
                      </span>, <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.string}>
                        {'Pragmatic Scaling'}
                      </span>
                      , <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.string}>
                        {'Cloud Architecture'}
                      </span>
                      <br />
                      &nbsp;&nbsp;],
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.property}>backstory</span>:{' '}
                      <span className={styles.string}>
                        `Driven by a strong curiosity for system internals and
                        computing,
                        <br />
                        &nbsp;&nbsp;I taught myself to program early on. Today,
                        my professional
                        <br />
                        &nbsp;&nbsp;career is characterized by solving complex
                        backend challenges,
                        <br />
                        &nbsp;&nbsp;optimizing high-performance APIs, and
                        designing scalable cloud
                        <br />
                        &nbsp;&nbsp;infrastructures, always with a strong
                        product-driven mindset.`
                      </span>
                      <br />
                      {'};'}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Desktop Presentation Layer */}
            <motion.div
              className={styles.presentationLayer}
              style={{ opacity: presentationOpacity, y: presentationY }}
            >
              {/* Left Panel: Git Graph Timeline */}
              <div className={styles.gitGraphPanel}>
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
                    experienceProgress.get() >= 0.38
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
                        <div className={styles.terminalMetaRow}>
                          <span className={styles.terminalMetaItem}>
                            <span style={{ color: '#ffbd2e' }}>commit</span>{' '}
                            {activeCommit.hash}
                          </span>
                          {activeCommit.tag && (
                            <span className={styles.terminalMetaItem}>
                              <span style={{ color: 'var(--color-accent)' }}>
                                tag:
                              </span>{' '}
                              {activeCommit.tag}
                            </span>
                          )}
                          <span className={styles.terminalMetaItem}>
                            {activeCommit.date}
                          </span>
                        </div>

                        <h3 className={styles.terminalRoleTitle}>
                          {activeCommit.role}
                        </h3>
                        <div className={styles.terminalCompanyRow}>
                          @ {activeCommit.company}
                          <span className={styles.terminalLocationLabel}>
                            {activeCommit.location}
                          </span>
                        </div>

                        <div className={styles.achievementsBlock}>
                          <div className={styles.achievementsTitle}>
                            diff --git a/achievements b/achievements
                          </div>
                          <ul className={styles.achievementsList}>
                            {activeCommit.bulletPoints.map((bullet, i) => (
                              <li key={i} className={styles.achievementLine}>
                                <span className={styles.achievementPlus}>
                                  +
                                </span>
                                <span className={styles.achievementText}>
                                  {bullet}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

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
