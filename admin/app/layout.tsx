import type { Metadata } from 'next';
import { Bodoni_Moda, DM_Sans } from 'next/font/google';
import { colors } from '@/lib/design';
import './globals.css';

const bodoni = Bodoni_Moda({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Canine Society · Moderation',
  description: 'Moderator dashboard for the Canine Society membership.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${dmSans.variable}`}>
      <body style={{ background: colors.sand, color: colors.deepOcean, margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
