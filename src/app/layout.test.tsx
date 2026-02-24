import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ variable: '--font-sans' }),
  Space_Mono: () => ({ variable: '--font-mono' }),
}));

import RootLayout, { metadata } from './layout';

describe('RootLayout SEO and Accessibility', () => {
  test('metadata contains expected SEO tags including OpenGraph', () => {
    // Use unknown to avoid typescript errors for dynamic Next.js types
    const title = metadata.title as unknown as {
      template: string;
      default: string;
    };
    expect(title?.template).toContain('%s');
    expect(title?.default).toContain('Senior Software Developer');
    expect(metadata.description).toContain('Senior Software Developer');
    expect(metadata.keywords).toContain('Senior Software Developer');

    expect(metadata.openGraph).toBeDefined();
    const openGraph = metadata.openGraph as unknown as {
      type: string;
      title: string;
      images: unknown;
    };
    expect(openGraph?.type).toBe('website');
    expect(openGraph?.title).toContain('Senior Software Developer');
    expect(openGraph?.images).toBeDefined();
  });

  test('RootLayout renders JSON-LD Person schema', () => {
    const layout = RootLayout({ children: <div>Content</div> });
    const htmlObj = layout;
    expect(htmlObj.type).toBe('html');

    // Check if children contain the head and script
    const headChildren = htmlObj.props.children[0].props.children;
    let scriptChild = null;
    if (Array.isArray(headChildren)) {
      scriptChild = headChildren.find((c) => c?.type === 'script');
    } else if (headChildren?.type === 'script') {
      scriptChild = headChildren;
    }

    expect(scriptChild).toBeDefined();
    expect(scriptChild.props.type).toBe('application/ld+json');

    const schemaContent = scriptChild.props.dangerouslySetInnerHTML.__html;
    expect(schemaContent).toContain('"@type":"Person"');
    expect(schemaContent).toContain('"jobTitle":"Senior Software Developer"');
    expect(schemaContent).toContain('"knowsAbout"');
    expect(schemaContent).toContain('Backend Development');
  });

  test.skip('og-image.png exists in public folder for SEO sharing', () => {
    const ogImagePath = path.resolve(process.cwd(), 'public/og-image.png');
    expect(fs.existsSync(ogImagePath)).toBe(true);
  });
});
