import './globals.css';
import { Outfit } from 'next/font/google';
import { Metadata } from 'next';

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
  metadataBase: new URL('https://fossradar.com'), // Replace with your actual domain
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fossradar.com',
    title: 'FossRadar | Better Open Source Alternatives',
    description: 'Find high-quality FOSS replacements for common SaaS products. Community-driven and privacy-focused.',
    siteName: 'FossRadar',
    images: [
      {
        url: '/og-image.png', // You should create this asset
        width: 1200,
        height: 630,
        alt: 'FossRadar Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FossRadar | Better Open Source Alternatives',
    description: 'Find high-quality FOSS replacements for common SaaS products.',
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
    <html lang="en" data-theme="dark">
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
        {children}
      </body>
    </html>
  );
}
