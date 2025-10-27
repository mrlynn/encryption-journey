import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Navigation } from "@/components/Navigation/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Encryption Journey Visualizer",
  description: "Visualize patient record encryption flow through client-side encryption → transport → MongoDB Queryable Encryption → decryption",
  keywords: ["encryption", "mongodb", "queryable encryption", "visualization", "healthcare"],
  authors: [{ name: "SecureHealth.dev" }],
  robots: "index, follow",
  openGraph: {
    title: "Encryption Journey Visualizer",
    description: "Visualize patient record encryption flow through MongoDB Queryable Encryption",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-mongo-dark-900 text-neutral-100`}>
        <QueryProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
