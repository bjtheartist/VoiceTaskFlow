import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Murmur — voice journal",
  description: "Speak your day. Murmur turns voice notes into a daily task journal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased">
        <header className="mx-auto flex w-full max-w-2xl items-baseline justify-between px-6 pt-8 pb-2">
          <Link href="/" className="group">
            <span className="font-display text-2xl tracking-tight text-cream-100">
              Murmur
            </span>
            <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 group-hover:text-ember-400 transition-colors">
              voice journal
            </span>
          </Link>
          <nav className="flex gap-5 font-mono text-[12px] uppercase tracking-[0.15em]">
            <Link href="/" className="text-ink-300 hover:text-ember-300 transition-colors">
              Today
            </Link>
            <Link href="/projects" className="text-ink-300 hover:text-ember-300 transition-colors">
              Projects
            </Link>
            <Link href="/journal" className="text-ink-300 hover:text-ember-300 transition-colors">
              Journal
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl px-6 pb-24">{children}</main>
      </body>
    </html>
  );
}
