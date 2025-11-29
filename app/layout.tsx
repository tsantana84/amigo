import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Secret Santa',
  description: 'Simple Secret Santa app for your group',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
