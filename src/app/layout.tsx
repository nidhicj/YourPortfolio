import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nidhi Joshi — AI/ML Engineer',
  description: 'I don\'t ship AI without guardrails. Building robust, explainable systems end-to-end.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
