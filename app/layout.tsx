import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenGovs - Public Budget Transparency",
  description:
    "Explore U.S. Department of Education budgets (FY2023-2025) through AI-powered Q&A. Budget scores, spending analysis, and drill-down for the public.",
  openGraph: {
    title: "OpenGovs - Public Budget Transparency",
    description:
      "AI-powered exploration of government education budgets. Get instant answers about public spending.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
