import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: 'JGDD — Design. Develop. Deploy — Faster.',
  description: 'Single-website builds done right: clear scope, fast delivery, production quality. Book a call.',
  keywords: [
    'web design',
    'web development',
    'Next.js',
    'React',
    'landing pages',
    'website design',
    'custom websites',
    'single website',
    'fast delivery'
  ],
  authors: [{ name: 'JGDD' }],
  creator: 'JGDD',
  publisher: 'JGDD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://quietforge.studio'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JGDD — Design. Develop. Deploy — Faster.',
    description: 'Single-website builds done right: clear scope, fast delivery, production quality. Book a call.',
    url: 'https://quietforge.studio',
    siteName: 'JGDD',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'JGDD — Design. Develop. Deploy — Faster.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JGDD — Design. Develop. Deploy — Faster.',
    description: 'Single-website builds done right: clear scope, fast delivery, production quality.',
    images: ['/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export function createPageMetadata(
  title: string,
  description: string,
  path: string = '/'
): Metadata {
  return {
    title,
    description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url: `https://quietforge.studio${path}`,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    },
    alternates: {
      canonical: path,
    },
  };
}





