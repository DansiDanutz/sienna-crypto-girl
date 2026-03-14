import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zmarty | Member Area",
  description: "Zmarty member platform — billing, API access, and market intelligence tiers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
