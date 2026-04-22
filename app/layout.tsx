import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "CareRing",
  description: "A caring presence, always within reach.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

function DescriptionPanel() {
  return (
    <div className="description-panel hidden md:block">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🩺</span>
          <h1 className="font-serif text-3xl text-white">CareRing</h1>
        </div>
        <p className="text-base text-white/80 leading-relaxed">
          A caring presence, always within reach.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-white mb-2">For Elders</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-start gap-2">
              <span>🌸</span>
              <span>Talk to Rosie — your AI companion for daily check-ins</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💊</span>
              <span>Track your medicines and get reminded when to take them</span>
            </li>
            <li className="flex items-start gap-2">
              <span>💝</span>
              <span>Share how you&apos;re feeling with a simple tap</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🗣️</span>
              <span>Voice-first design — just talk, no complicated forms</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-white mb-2">For Caregivers</h2>
          <ul className="space-y-2 text-white/70 text-sm">
            <li className="flex items-start gap-2">
              <span>📋</span>
              <span>Upload prescriptions — medicines sync automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔔</span>
              <span>Real-time alerts when something needs attention</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📊</span>
              <span>Monitor mood, symptoms, and medication adherence</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Easy acknowledgment when you&apos;ve seen an alert</span>
            </li>
          </ul>
        </div>

        <div className="pt-3 border-t border-white/20">
          <p className="text-xs text-white/50">
            Powered by Gemini AI for smart health analysis and ElevenLabs for natural voice interactions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>
          <div className="desktop-layout">
            <DescriptionPanel />
            <div className="phone-wrapper">
              <div className="phone-frame">
                <div className="phone-inner h-full bg-[var(--background)]">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
