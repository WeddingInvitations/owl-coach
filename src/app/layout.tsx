import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Fallback to system fonts
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Owl Coach - Plataforma de Planes de Entrenamiento',
  description: 'Plataforma profesional de planes de entrenamiento y coaching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}