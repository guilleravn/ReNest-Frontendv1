import type { Metadata } from "next";
import { JetBrains_Mono, Playfair_Display, Urbanist } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

// Stand-in for Diphylleia, the reference site's heading font: it isn't publicly available,
// and the reference's own font stack already falls back to Playfair Display.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReNest",
  description: "ReNest web app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${urbanist.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
