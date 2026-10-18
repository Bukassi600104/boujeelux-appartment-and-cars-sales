import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://chida-moore-automobiles.tonyorji.chatgpt.site";
export const SITE_NAME = "Chida Moore Automobiles";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;

export function getSiteUrl(value = configuredSiteUrl): URL {
  try {
    const url = new URL(value);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export type SeoSiteSettings = {
  siteUrl?: string | null;
  canonicalUrl?: string | null;
};

export function getPublicSiteUrl(settings?: SeoSiteSettings | null): URL {
  return getSiteUrl(settings?.canonicalUrl ?? settings?.siteUrl ?? configuredSiteUrl);
}

export function absoluteUrl(path = "/", base = getSiteUrl()): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, base).toString();
}

export function pageMetadata(path: string, title: string, description: string, image?: string, base = getPublicSiteUrl()): Metadata {
  const canonical = absoluteUrl(path, base);
  const images = image ? [{ url: absoluteUrl(image, base), alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [absoluteUrl(image, base)] : undefined,
    },
  };
}

type OrganizationSettings = SeoSiteSettings & {
  contact?: {
    phones?: Array<{ href: string }>;
    emails?: string[];
    instagram?: string;
  };
};

export function organizationJsonLd(settings?: OrganizationSettings | null) {
  const base = getPublicSiteUrl(settings);
  const telephone = settings?.contact?.phones?.[0]?.href.replace(/^tel:/, "");
  const email = settings?.contact?.emails?.[0];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base.origin}/#organization`,
    name: SITE_NAME,
    url: base.origin,
    ...(settings?.contact?.instagram ? { sameAs: [settings.contact.instagram] } : {}),
    ...(telephone || email ? {
      contactPoint: [{
        "@type": "ContactPoint",
        contactType: "sales",
        ...(telephone ? { telephone } : {}),
        ...(email ? { email } : {}),
      }],
    } : {}),
  };
}

export type VehicleJsonLdInput = {
  slug: string;
  name: string;
  make: string;
  year?: string | null;
  image?: string | null;
  gallery?: Array<{ src: string }>;
  description?: string | null;
  availability?: "Available" | "Reserved" | "Sold" | string;
  showPrice?: boolean;
  priceValue?: number;
};

const offerAvailability: Record<string, string> = {
  Available: "https://schema.org/InStock",
  Reserved: "https://schema.org/LimitedAvailability",
  Sold: "https://schema.org/SoldOut",
};

export function vehicleJsonLd(vehicle: VehicleJsonLdInput, base = getPublicSiteUrl()) {
  const url = absoluteUrl(`/vehicles/${encodeURIComponent(vehicle.slug)}`, base);
  const imagePaths = [vehicle.image, ...(vehicle.gallery?.map((item) => item.src) ?? [])]
    .filter((value): value is string => Boolean(value));
  const images = [...new Set(imagePaths)].map((src) => absoluteUrl(src, base));
  const hasPrice = vehicle.showPrice !== false && typeof vehicle.priceValue === "number" && vehicle.priceValue > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "@id": `${url}#vehicle`,
    name: vehicle.name,
    url,
    brand: { "@type": "Brand", name: vehicle.make },
    ...(vehicle.year ? { vehicleModelDate: vehicle.year } : {}),
    ...(images.length ? { image: images } : {}),
    ...(vehicle.description ? { description: vehicle.description } : {}),
    ...(hasPrice ? {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "NGN",
        price: vehicle.priceValue,
        ...(vehicle.availability && offerAvailability[vehicle.availability]
          ? { availability: offerAvailability[vehicle.availability] }
          : {}),
      },
    } : {}),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export type SitemapVehicle = {
  slug: string;
  updatedAt?: string | Date | null;
};

export type SitemapEntry = {
  path: string;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
  lastModified?: string | Date | null;
};

const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const isoDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
};

export function buildSitemapEntries(vehicles: SitemapVehicle[]): SitemapEntry[] {
  const staticEntries: SitemapEntry[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/inventory", changeFrequency: "daily", priority: 0.9 },
    { path: "/sourcing", changeFrequency: "monthly", priority: 0.7 },
    { path: "/inspection", changeFrequency: "monthly", priority: 0.6 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  ];

  const seen = new Set<string>();
  const vehicleEntries = vehicles.flatMap<SitemapEntry>((vehicle) => {
    const slug = vehicle.slug.trim();
    if (!slug || seen.has(slug)) return [];
    seen.add(slug);
    return [{
      path: `/vehicles/${encodeURIComponent(slug)}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: vehicle.updatedAt,
    }];
  });

  return [...staticEntries, ...vehicleEntries];
}

export function renderSitemapXml(entries: SitemapEntry[], base = getSiteUrl()): string {
  const urls = entries.map((entry) => {
    const lastModified = isoDate(entry.lastModified);
    const parts = [
      `    <loc>${escapeXml(absoluteUrl(entry.path, base))}</loc>`,
      lastModified ? `    <lastmod>${lastModified}</lastmod>` : null,
      entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : null,
      typeof entry.priority === "number" ? `    <priority>${entry.priority.toFixed(1)}</priority>` : null,
    ].filter(Boolean);
    return `  <url>\n${parts.join("\n")}\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderRobotsTxt(base = getSiteUrl()): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
    `Sitemap: ${absoluteUrl("/sitemap.xml", base)}`,
    "",
  ].join("\n");
}
