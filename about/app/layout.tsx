import type { Metadata } from "next";
import { Fraunces, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "700", "900"],
  style: ["normal", "italic"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "900"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alish — About Me",
  description: "The fun version of my story. Builder, tinkerer, and enthusiastic overthinker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} antialiased`}
    >
      <body
        className="min-h-screen selection:bg-amber-900/30 selection:text-amber-200"
        style={{ fontFamily: "var(--font-nunito, Nunito, sans-serif)" }}
      >
        {children}
      </body>
    </html>
  );
}
