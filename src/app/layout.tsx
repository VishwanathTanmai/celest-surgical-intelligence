import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SurgicalProvider } from "@/context/SurgicalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CELEST | Surgical Intelligence Platform",
  description: "Advanced AI-driven surgical analytics and clinical insights for modern healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground surgical-background`}>
        <React.Suspense fallback={null}>
          <SurgicalProvider>
            {children}
          </SurgicalProvider>
        </React.Suspense>
      </body>
    </html>
  );
}
