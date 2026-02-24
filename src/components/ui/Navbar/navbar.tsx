'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { navItems } from './_data/nav-items';
import styles from './navbar.module.css';
import { useConnect } from './use-navbar';

export function Navbar() {
  const { activeSection, isMobileMenuOpen, handleClick, toggleMobileMenu } =
    useConnect();

  return (
    <header className={styles.header} role="banner" aria-label="Site Header">
      <nav className={styles.navbar} aria-label="Main navigation">
        {/* Desktop Navigation */}
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <li key={item.href} className={styles.navItem}>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className={styles.activePill}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
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
                initial={{ opacity: 0, rotate: -90, y: -15 }}
                animate={{ opacity: 1, rotate: 0, y: 0 }}
                exit={{ opacity: 0, rotate: 90, y: 15 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <motion.path
                  d="M18 6L6 18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                <motion.path
                  d="M6 6l12 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
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
                initial={{ opacity: 0, rotate: -90, y: -15 }}
                animate={{ opacity: 1, rotate: 0, y: 0 }}
                exit={{ opacity: 0, rotate: 90, y: 15 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <motion.path
                  d="M3 6h18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                <motion.path
                  d="M3 12h18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                />
                <motion.path
                  d="M3 18h18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileNavOverlay}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className={styles.mobileNavList}>
              {navItems.map((item, index) => {
                const isActive = activeSection === item.href;
                return (
                  <motion.li
                    key={item.href}
                    className={styles.mobileNavItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + index * 0.1,
                      duration: 0.4,
                      ease: 'easeOut',
                    }}
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
