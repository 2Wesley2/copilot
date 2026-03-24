import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Copilot Web POC',
  description: 'Interface inicial de chat com streaming progressivo e desacoplamento dos mocks.',
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="pt-BR">
    <body>{children}</body>
  </html>
);

export default RootLayout;
