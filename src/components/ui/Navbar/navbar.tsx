'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { navItems } from './navbar.constants';
import styles from './navbar.module.css';
import { useConnect } from './use-navbar';

export function Navbar() {
  const { activeSection, isMobileMenuOpen, handleClick, toggleMobileMenu } =
    useConnect();
  const shouldReduceMotion = useReducedMotion();
  const trapRef = useFocusTrap(
    isMobileMenuOpen,
  ) as React.RefObject<HTMLDivElement | null>;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
      aria-label="Site Header"
    >
      <nav className={styles.navbar} aria-label="Main navigation">
        {/* Terminal Logo Prompt */}
        <a
          href="#hero"
          className={styles.logoPrompt}
          onClick={(e) => handleClick(e, '#hero')}
          aria-label="Back to top"
        >
          <span className={styles.promptUser}>fariassdev</span>
          <span className={styles.promptLocation}>:~$</span>
          <span className={styles.promptCursor} />
        </a>

        {/* Desktop Navigation */}
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <li key={item.href} className={styles.navItem}>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-underline"
                    className={styles.activeUnderline}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 30 }
                    }
                  />
                )}
                <a
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  onClick={(e) => handleClick(e, item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Jump to ${item.label} section`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          className={styles.mobileNavToggle}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <AnimatePresence initial={false}>
            {isMobileMenuOpen ? (
              <motion.svg
                key="close"
                className={styles.absoluteIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: shouldReduceMotion ? 0 : 90 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="hamburger"
                className={styles.absoluteIcon}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: shouldReduceMotion ? 0 : 90 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={trapRef}
            className={styles.mobileNavOverlay}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : '-100%' }}
            transition={{
              duration: shouldReduceMotion ? 0.01 : 0.4,
              ease: 'easeOut',
            }}
          >
            <ul className={styles.mobileNavList}>
              {navItems.map((item, index) => {
                const isActive = activeSection === item.href;
                return (
                  <motion.li
                    key={item.href}
                    className={styles.mobileNavItem}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.01 }
                        : {
                            delay: 0.2 + index * 0.1,
                            duration: 0.4,
                            ease: 'easeOut',
                          }
                    }
                  >
                    <a
                      href={item.href}
                      className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                      onClick={(e) => handleClick(e, item.href)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
