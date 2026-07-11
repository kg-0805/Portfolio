import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getSiteData } from '../lib/content';

const { profile } = getSiteData();

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.title}`,
  description: profile.description,
  metadataBase: new URL('https://kartikgupta.in'),
  openGraph: {
    title: `${profile.name} | ${profile.title}`,
    description: profile.description,
    url: 'https://kartikgupta.in',
    type: 'website',
    images: [{ url: '/assets/images/profile.jpg', width: 1200, height: 1200, alt: profile.name }]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} | ${profile.title}`,
    description: profile.description,
    images: ['/assets/images/profile.jpg']
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
