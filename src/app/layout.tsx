import type { Metadata } from "next";
import { Diphylleia, JetBrains_Mono, Urbanist } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const diphylleia = Diphylleia({
  variable: "--font-diphylleia",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReNest",
  description: "De segunda mano, sin preocupaciones",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${urbanist.variable} ${diphylleia.variable} ${jetbrainsMono.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
