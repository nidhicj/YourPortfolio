import type { Metadata } from 'next';
import './globals.css';
import { siteMeta } from '@/data/profile';

export const metadata: Metadata = {
  title:       siteMeta.title,
  description: siteMeta.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
