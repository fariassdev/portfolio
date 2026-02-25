import { useState, useEffect, useRef, useCallback } from 'react';
import { navItems } from './_data/nav-items';

export const useConnect = () => {
  const [activeSection, setActiveSection] = useState('#hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const getSections = useCallback(() => {
    return navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Prevent observer from firing while we are programmatically scrolling via click
        if (isScrollingRef.current) return;

        const intersectingEntry = entries.find((entry) => entry.isIntersecting);
        if (intersectingEntry) {
          setActiveSection(`#${intersectingEntry.target.id}`);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      },
    );

    const sections = getSections();
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [getSections]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const originalBodyStyle = globalThis.getComputedStyle(
      document.body,
    ).overflow;
    const originalHtmlStyle = globalThis.getComputedStyle(
      document.documentElement,
    ).overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      setActiveSection(href);

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Resume observer after typical smooth scroll duration (approx 800ms)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
    [isMobileMenuOpen],
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return {
    activeSection,
    isMobileMenuOpen,
    handleClick,
    toggleMobileMenu,
  };
};
