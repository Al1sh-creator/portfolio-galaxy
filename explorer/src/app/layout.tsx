import type { Metadata } from "next";
import { Lora, Nunito } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Explorer | The Arcane Laboratory",
  description: "A whimsical, Ghibli-inspired exploration of skills and journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-screen bg-[var(--color-surface)] selection:bg-[var(--color-primary-container)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
