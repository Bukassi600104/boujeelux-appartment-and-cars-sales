import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chida Moore Automobiles | Premium Vehicles",
  description: "Discover carefully selected premium vehicles from Chida Moore Automobiles.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
