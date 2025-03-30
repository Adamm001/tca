import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomzo",
  description: "Book trade and exchange platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#191919]">{children}</body>
    </html>
  );
}
