import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Fallback to system fonts
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Owl Coach - Training Plans Platform',
  description: 'Professional training plans and coaching platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}