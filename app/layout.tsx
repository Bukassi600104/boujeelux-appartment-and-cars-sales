/* eslint-disable @next/next/no-page-custom-font -- Root App Router layout applies these swap fonts to every route. */
import type { Metadata } from "next";
import "./globals.css";
import { CmsProvider } from "@/components/cms-provider";
import { getPublicContent } from "@/lib/cms/store";
import { getPublicSiteUrl,organizationJsonLd,serializeJsonLd } from "@/lib/seo";

export async function generateMetadata():Promise<Metadata>{const {settings}=await getPublicContent();return {
  metadataBase:getPublicSiteUrl(settings),title:settings.seoTitle,description:settings.seoDescription,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};}
export const dynamic="force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content=await getPublicContent();
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head>
      <body className="antialiased" suppressHydrationWarning><a className="skip-link" href="#main-content">Skip to content</a><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(organizationJsonLd(content.settings))}}/><CmsProvider content={content}>{children}</CmsProvider></body>
    </html>
  );
}
