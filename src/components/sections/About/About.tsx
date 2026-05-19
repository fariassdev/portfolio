'use client';

import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
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

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export function About() {
  const { experienceRef, experienceProgress } = useScrollTimeline();
  const [shouldAnimateTitle, setShouldAnimateTitle] = useState(false);

  // Terminal states
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loginDate, setLoginDate] = useState('Tue May 19 06:32:11 2026');

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set safe client-only date on mount to prevent SSR hydration mismatch
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoginDate(formatted);
  }, []);

  // Auto-scroll terminal body on history changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Title transitions (Stage 1)
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
    SCROLL_HINT_TIMING,
    [0, 0, 1, 1, 0],
  );

  // Layout Container Transition (Stage 2)
  const layoutOpacity = useTransform(
    experienceProgress,
    LAYOUT_TIMING_OPACITY,
    [0, 1, 1, 0],
  );

  const layoutY = useTransform(
    experienceProgress,
    LAYOUT_TIMING_OPACITY,
    [180, 0, 0, -80],
  );

  // Zoom-up OS window opening animation driven by scroll progression
  const layoutScale = useTransform(
    experienceProgress,
    LAYOUT_TIMING_OPACITY,
    [0.6, 1, 1, 0.85],
  );

  // Handle title animation state on scroll
  useMotionValueEvent(experienceProgress, 'change', (progress) => {
    if (progress > 0.01) {
      if (!shouldAnimateTitle) setShouldAnimateTitle(true);
    } else if (shouldAnimateTitle) {
      setShouldAnimateTitle(false);
    }
  });

  const handleInteractiveClick = (
    optionId: string,
    label: string,
    value: string,
    url?: string,
  ) => {
    // Add command to log
    const cmdText =
      optionId === 'email' ? 'copy email.txt' : `open ${optionId}.url`;
    const newLogs: TerminalLine[] = [
      { type: 'input', text: `guest@fernandoas.com:~$ ${cmdText}` },
    ];

    if (optionId === 'email') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      newLogs.push({
        type: 'success',
        text: `✔ Copied email [${value}] to clipboard successfully!`,
      });
    } else if (url) {
      newLogs.push({
        type: 'output',
        text: `Launching browser session... redirecting to ${value}`,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTerminalHistory((prev) => [...prev, ...newLogs]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs: TerminalLine[] = [
      { type: 'input', text: `guest@fernandoas.com:~$ ${commandInput}` },
    ];

    if (cmd === 'help') {
      newLogs.push(
        { type: 'output', text: 'Available commands:' },
        {
          type: 'output',
          text: "  bio        - Display Fernando's professional bio",
        },
        {
          type: 'output',
          text: '  contact    - Show social and professional links',
        },
        {
          type: 'output',
          text: '  neofetch   - Display system hardware & stack metrics',
        },
        {
          type: 'output',
          text: '  github     - Open GitHub profile in a new window',
        },
        {
          type: 'output',
          text: '  linkedin   - Open LinkedIn profile in a new window',
        },
        {
          type: 'output',
          text: '  email      - Copy contact email to clipboard',
        },
        {
          type: 'output',
          text: "  resume     - Download/view Fernando's resume",
        },
        {
          type: 'output',
          text: '  clear      - Clear the console output history',
        },
        { type: 'output', text: '  sudo       - Try gaining superuser powers' },
        {
          type: 'output',
          text: '  coffee     - Brew a fresh cup of coffee for the developer',
        },
      );
    } else if (cmd === 'bio' || cmd === 'cat bio.md') {
      newLogs.push(
        { type: 'output', text: '--- FERNANDO ARIAS SANTOS ---' },
        {
          type: 'output',
          text: 'I started my coding journey as a curious self-taught kid hacking gaming consoles, later transitioning into professional backend engineering. Since then, I’ve built high-performance APIs and robust cloud architectures, collaborating with multidisciplinary teams and scaling systems that serve over half a million active users.',
        },
        {
          type: 'output',
          text: 'My background in computer science helps me tackle complex backend migrations and system optimizations with clarity and efficiency, ensuring high code quality under pressure.',
        },
      );
    } else if (cmd === 'contact' || cmd === 'ls') {
      newLogs.push(
        { type: 'output', text: 'Contact Channels:' },
        { type: 'output', text: '  GitHub:   github.com/fariassdev' },
        {
          type: 'output',
          text: '  LinkedIn: linkedin.com/in/fernando-arias-santos/',
        },
        { type: 'output', text: '  Email:    hello@fernandoas.com' },
        { type: 'output', text: '  Resume:   fernandoas.com/resume.pdf' },
      );
    } else if (cmd === 'neofetch') {
      newLogs.push({
        type: 'output',
        text: `               .---.         farias@portfolio
              /     \\        ----------------
              \\     /        OS: fariassdev-OS v1.4.0
               \`---'         KERNEL: React 18 / Next.js 14
                             UPTIME: 4h 52m
                             SHELL: zsh 5.9
                             ROLE: Senior Software Developer
                             STACK: Node.js, TS, Postgres, AWS, Python
                             FOCUS: Backend Architecture / UX`,
      });
    } else if (cmd === 'github') {
      newLogs.push({ type: 'output', text: 'Opening GitHub profile...' });
      window.open(
        'https://github.com/fariassdev',
        '_blank',
        'noopener,noreferrer',
      );
    } else if (cmd === 'linkedin') {
      newLogs.push({ type: 'output', text: 'Opening LinkedIn profile...' });
      window.open(
        'https://www.linkedin.com/in/fernando-arias-santos/',
        '_blank',
        'noopener,noreferrer',
      );
    } else if (cmd === 'email') {
      navigator.clipboard.writeText('hello@fernandoas.com');
      newLogs.push({
        type: 'success',
        text: '✔ Email hello@fernandoas.com copied to clipboard!',
      });
    } else if (cmd === 'resume') {
      newLogs.push({ type: 'output', text: 'Opening resume.pdf...' });
      window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    } else if (cmd === 'sudo') {
      newLogs.push(
        { type: 'output', text: '[sudo] password for guest: ********' },
        {
          type: 'error',
          text: 'ERROR: Permission denied. Nice try! You do not have superuser privileges.',
        },
      );
    } else if (cmd === 'coffee' || cmd === 'brew') {
      newLogs.push(
        {
          type: 'output',
          text: '[INFO] Initializing espresso_maker_daemon...',
        },
        { type: 'output', text: '[INFO] Grinding premium Arabica beans...' },
        { type: 'output', text: '[INFO] Heating water to 94.5°C...' },
        {
          type: 'output',
          text: '[INFO] Extracting double shot espresso under 9 bars of pressure...',
        },
        { type: 'error', text: "HTTP/1.1 418 I'm a Teapot" },
        {
          type: 'error',
          text: 'System Error: The coffee maker is actually a teapot.',
        },
        {
          type: 'success',
          text: '☕ Tip: Feed the developer code or cookies to recover.',
        },
      );
    } else {
      newLogs.push({
        type: 'error',
        text: `Command not found: '${commandInput}'. Type 'help' for available commands.`,
      });
    }

    setTerminalHistory((prev) => [...prev, ...newLogs]);
    setCommandInput('');
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const contactOptions = [
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/fariassdev',
      url: 'https://github.com/fariassdev',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'linkedin.com/in/fariassdev',
      url: 'https://www.linkedin.com/in/fernando-arias-santos/',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      value: 'hello@fernandoas.com',
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: 'resume',
      label: 'Resume',
      value: 'download_cv.pdf',
      url: '/resume.pdf',
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ];

  return (
    <section id="experience" className={styles.section} aria-label="About Me">
      <div
        ref={experienceRef}
        className={styles.scrollSpacer}
        style={{ height: `${TOTAL_SPACER_HEIGHT}vh` }}
      >
        <div className={styles.stickyViewport}>
          <div className={styles.contentContainer}>
            {/* Title Overlay */}
            <motion.div
              className={styles.titleWrapper}
              style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
            >
              <div className={styles.titleBackground}>
                BIO_CATALOG: RUNNING // SOURCE: FERNANDO
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

            {/* Editorial Sticky Layout */}
            <motion.div
              className={styles.editorialLayout}
              style={{ opacity: layoutOpacity, y: layoutY, scale: layoutScale }}
            >
              <div className={styles.proseContainer}>
                {/* Sleek retro-futuristic Interactive Terminal */}
                <div className={styles.terminalWindow} onClick={focusInput}>
                  {/* Terminal Header */}
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalButtons}>
                      <span
                        className={`${styles.terminalDot} ${styles.terminalDotRed}`}
                      />
                      <span
                        className={`${styles.terminalDot} ${styles.terminalDotYellow}`}
                      />
                      <span
                        className={`${styles.terminalDot} ${styles.terminalDotGreen}`}
                      />
                    </div>
                    <span className={styles.terminalTitle}>
                      guest@fernandoas.com: ~/about
                    </span>
                    <span className={styles.terminalTab}>zsh</span>
                  </div>

                  {/* Terminal Body */}
                  <div className={styles.terminalBody} ref={terminalBodyRef}>
                    <div className={styles.terminalContentWrapper}>
                      {/* Startup line */}
                      <div className={styles.terminalLine}>
                        <span className={styles.terminalTitle}>
                          Last login: {loginDate} on ttys001
                        </span>
                      </div>

                      {/* Bio Auto Command */}
                      <div className={styles.terminalLine}>
                        <div className={styles.terminalPrompt}>
                          <span className={styles.promptUser}>guest</span>
                          <span className={styles.promptSymbol}>@</span>
                          <span className={styles.promptLoc}>
                            fernandoas.com
                          </span>
                          <span className={styles.promptSymbol}>:~$</span>
                          <span className={styles.terminalCommandText}>
                            {' '}
                            cat bio.md
                          </span>
                        </div>

                        {/* Bio Output Paragraphs */}
                        <div className={styles.terminalOutput}>
                          <p className={styles.paragraph}>
                            I&apos;m{' '}
                            <span className={styles.accentWord}>Fernando</span>!
                            I started my coding journey as a curious self-taught
                            kid hacking gaming consoles, later transitioning
                            into professional backend engineering. Since then,
                            I’ve built high-performance APIs and robust cloud
                            architectures, collaborating with multidisciplinary
                            teams and scaling systems that serve over half a
                            million active users.
                          </p>
                          <p className={styles.paragraph}>
                            A{' '}
                            <span className={styles.boldWord}>
                              self-learner at heart
                            </span>
                            , I thrive on mastering system internals and staying
                            ahead of engineering practices. My background in
                            computer science helps me tackle complex backend
                            migrations and system optimizations with clarity and
                            efficiency, ensuring high code quality under
                            pressure.
                          </p>
                          <p className={styles.paragraph}>
                            Outside of work, I enjoy practicing{' '}
                            <span className={styles.boldWord}>
                              all kinds of sports
                            </span>
                            , traveling, and hanging out with friends. I&apos;m
                            also deeply fascinated by the{' '}
                            <span className={styles.boldWord}>
                              latest AI advancements
                            </span>{' '}
                            and constantly learning and experimenting within the
                            expanding{' '}
                            <span className={styles.accentWord}>
                              AI ecosystem
                            </span>
                            .
                          </p>
                        </div>
                      </div>

                      {/* Interactive Contacts command */}
                      <div className={styles.terminalLine}>
                        <div className={styles.terminalPrompt}>
                          <span className={styles.promptUser}>guest</span>
                          <span className={styles.promptSymbol}>@</span>
                          <span className={styles.promptLoc}>
                            fernandoas.com
                          </span>
                          <span className={styles.promptSymbol}>:~$</span>
                          <span className={styles.terminalCommandText}>
                            {' '}
                            contact --channels
                          </span>
                        </div>

                        {/* Menu Info */}
                        <div className={styles.cliMenu}>
                          <span className={styles.cliMenuTitle}>
                            ➔ Select channel to execute connection:
                          </span>
                          <div className={styles.cliOptionsGrid}>
                            {contactOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className={`${styles.cliOption} ${hoveredOption === opt.id ? styles.cliOptionActive : ''}`}
                                onMouseEnter={() => setHoveredOption(opt.id)}
                                onMouseLeave={() => setHoveredOption(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInteractiveClick(
                                    opt.id,
                                    opt.label,
                                    opt.value,
                                    opt.url,
                                  );
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleInteractiveClick(
                                      opt.id,
                                      opt.label,
                                      opt.value,
                                      opt.url,
                                    );
                                  }
                                }}
                              >
                                <span className={styles.cliOptionArrow}>➔</span>
                                <div className={styles.cliOptionText}>
                                  <span className={styles.cliOptionLabel}>
                                    [{opt.label}]
                                  </span>
                                  <span className={styles.cliOptionValue}>
                                    {opt.value}
                                  </span>
                                </div>
                                <span className={styles.cliOptionIcon}>
                                  {opt.icon}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Typed History Outputs */}
                      {terminalHistory.map((line, idx) => (
                        <div key={idx} className={styles.terminalLine}>
                          {line.type === 'input' ? (
                            <div className={styles.terminalPrompt}>
                              <span className={styles.promptUser}>guest</span>
                              <span className={styles.promptSymbol}>@</span>
                              <span className={styles.promptLoc}>
                                fernandoas.com
                              </span>
                              <span className={styles.promptSymbol}>:~$</span>
                              <span className={styles.terminalCommandText}>
                                {' '}
                                {line.text.replace(
                                  'guest@fernandoas.com:~$ ',
                                  '',
                                )}
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`${styles.cliOutputItem} ${
                                line.type === 'error'
                                  ? styles.cliOutputItemError
                                  : line.type === 'success'
                                    ? styles.cliOutputItemSuccess
                                    : ''
                              }`}
                            >
                              {line.text}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Active Blinking Cursor & Easter Egg Input Field */}
                      <div className={styles.terminalInputLine}>
                        <div
                          className={styles.terminalPrompt}
                          style={{ margin: 0, padding: 0 }}
                        >
                          <span className={styles.promptUser}>guest</span>
                          <span className={styles.promptSymbol}>@</span>
                          <span className={styles.promptLoc}>
                            fernandoas.com
                          </span>
                          <span className={styles.promptSymbol}>:~$</span>
                        </div>
                        <form
                          onSubmit={handleCommandSubmit}
                          className={styles.commandForm}
                        >
                          <input
                            ref={inputRef}
                            type="text"
                            className={styles.commandInput}
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder="type 'help' for easter eggs..."
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            aria-label="Terminal Command Input"
                          />
                        </form>
                      </div>

                      {/* Premium CTA text styled inside terminal */}
                      <p className={styles.ctaParagraph}>
                        Let&apos;s build something extraordinary together!
                      </p>
                    </div>
                  </div>

                  {/* Built-in Status Footer */}
                  <div className={styles.inputHelp}>
                    {copied
                      ? '✔ Email copied to clipboard'
                      : 'Click inside the terminal window to type commands directly'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
