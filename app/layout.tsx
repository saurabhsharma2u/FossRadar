import './globals.css';
import { Outfit } from 'next/font/google';
import { Metadata } from 'next';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FossRadar | Discover Better Open Source Alternatives',
    template: '%s | FossRadar'
  },
  description: 'A curated, soft-brutalist radar for discovering powerful Free and Open Source software replacements (FOSS) for common SaaS tools. Search over 90+ community-vetted alternatives.',
  keywords: ['FOSS', 'Open Source', 'Software Alternatives', 'SaaS Alternatives', 'Privacy', 'Self-hosted'],
  authors: [{ name: 'FossRadar Contributors' }],
  creator: 'FossRadar',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://foss-radar.saurabh.app',
    title: 'FossRadar | Find FOSS Alternatives to Notion, Slack, & more',
    description: 'A curated radar for discovering high-quality Open Source replacements for Notion, Slack, Trello, and other common SaaS products.',
    siteName: 'FossRadar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FossRadar | Better Open Source Alternatives',
    description: 'Find FOSS replacements for Notion, Slack, and common SaaS products.',
    creator: '@fossradar',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme');
                  if (saved) {
                    document.documentElement.setAttribute('data-theme', saved);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={outfit.className}>
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
