import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TunHire",
  description: "Plateforme de recrutement pour la Tunisie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
