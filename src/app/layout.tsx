import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wasa — Tabi SDK Template',
  description: 'Boilerplate app showcasing the tabi-sdk for WhatsApp messaging.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
