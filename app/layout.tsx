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
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
