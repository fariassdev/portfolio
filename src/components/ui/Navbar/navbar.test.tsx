import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Navbar } from './navbar';

class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    return null;
  }
}

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

describe('Navbar Component', () => {
  it('renders a semantic nav element', () => {
    render(<Navbar />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeTruthy();
  });

  it('contains appropriate anchor links to sections', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('#hero');
    expect(hrefs).toContain('#work');
    expect(hrefs).toContain('#stack');
    expect(hrefs).toContain('#experience');
    expect(hrefs).toContain('#contact');
  });
});
