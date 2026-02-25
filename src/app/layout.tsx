import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
});

const spaceMono = Space_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Senior Software Developer | Fernando Arias Santos',
    default: 'Fernando Arias Santos | Senior Software Developer',
  },
  description:
    'Senior Software Developer specializing in Backend Architecture, Performance and Frontend Excellence. Explore my technical portfolio and projects.',
  keywords: [
    'Senior Software Developer',
    'Backend Developer',
    'System Architecture',
    'Next.js',
    'TypeScript',
    'Software Engineer',
    'Fernando Arias Santos',
  ],
  openGraph: {
    type: 'website',
    url: 'https://fernandoas.com',
    title: 'Fernando Arias Santos | Senior Software Developer',
    description:
      'Technical showcase of Backend Architecture and Frontend performance optimization.',
    siteName: 'Fernando Arias Santos',
    images: [
      {
        url: '/og-image.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Fernando Arias Santos',
    url: 'https://fernandoas.com',
    jobTitle: 'Senior Software Developer',
    description:
      'Senior Software Developer focused on Backend Architecture and User Experience.',
    sameAs: ['https://github.com/fariassdev'],
    knowsAbout: [
      'Backend Development',
      'System Architecture',
      'Frontend Development',
      'Next.js',
      'TypeScript',
      'Database Design',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only skip-link"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" role="main" aria-label="Main Content">
          {children}
        </main>
        <footer id="main-footer" role="contentinfo" aria-label="Site Footer">
          {/* Footer content will be implemented in future stories */}
        </footer>
      </body>
    </html>
  );
}
