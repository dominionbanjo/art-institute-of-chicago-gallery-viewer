import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';

export const runtime = 'edge';
import ThemeProvider from '@/components/shared/ThemeProvider';
import StoreProvider from '@/redux/StoreProvider';
import Header from '@/components/shared/Header';
import { Toaster } from 'sonner';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Art Institute of Chicago Gallery',
  description: 'Explore artworks from the Art Institute of Chicago collection',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
        <StoreProvider>
          <ThemeProvider>
            <Header />
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
