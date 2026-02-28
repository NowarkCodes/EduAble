import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'EduAble — Accessible Education for Every Student',
  description:
    'EduAble is an accessible e-learning platform built to WCAG 2.1 AA standards. Screen reader ready, keyboard friendly, and designed for every learner.',
  keywords: ['accessible education', 'e-learning', 'WCAG', 'screen reader', 'inclusive learning'],
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a56db" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <AccessibilityProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AccessibilityProvider>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
