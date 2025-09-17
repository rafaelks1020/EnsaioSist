import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ensaios Igreja',
  description: 'Sistema de gerenciamento de ensaios para conjunto da igreja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}