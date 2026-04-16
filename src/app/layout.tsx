import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'Comparateur courtiers, brokers & néobanques France | Arbitrage by VideoBourse',
  description: 'Comparez les frais de 40+ courtiers, néobanques et brokers CFD en France. Scores indépendants, avis vérifiés et simulateur de frais. Arbitrage by VideoBourse.',
  icons: {
    icon: 'https://framerusercontent.com/images/qimvwYEjN00Vjzt7SSbnQfmuB4.svg',
    shortcut: 'https://framerusercontent.com/images/qimvwYEjN00Vjzt7SSbnQfmuB4.svg',
    apple: 'https://framerusercontent.com/images/qimvwYEjN00Vjzt7SSbnQfmuB4.svg',
  },
  openGraph: {
    type: 'website',
    title: 'Comparateur courtiers, brokers & néobanques France | Arbitrage by VideoBourse',
    description: 'Comparez les frais de 40+ courtiers, néobanques et brokers CFD en France. Scores indépendants, avis vérifiés et simulateur de frais. Arbitrage by VideoBourse.',
    images: [{ url: 'https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparateur courtiers, brokers & néobanques France | Arbitrage by VideoBourse',
    description: 'Comparez les frais de 40+ courtiers, néobanques et brokers CFD en France. Scores indépendants, avis vérifiés et simulateur de frais. Arbitrage by VideoBourse.',
    images: ['https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png'],
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;
  return (
    <html lang='fr' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
        {/* Umami Analytics — RGPD, sans cookie */}
        <Script
          async
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || ''}
        />
      </body>
    </html>
  );
}