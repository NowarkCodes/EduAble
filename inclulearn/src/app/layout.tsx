import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduLearn — Accessible Education for Every Student',
  description:
    'EduLearn is an accessible e-learning platform built to WCAG 2.1 AA standards. Screen reader ready, keyboard friendly, and designed for every learner.',
  keywords: ['accessible education', 'e-learning', 'WCAG', 'screen reader', 'inclusive learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a56db" />
      </head>
      <body>{children}</body>
    </html>
  );
}
