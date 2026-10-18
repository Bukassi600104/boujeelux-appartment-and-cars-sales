import { getPublicContent } from "@/lib/cms/store";
import { buildSitemapEntries, getPublicSiteUrl, renderSitemapXml } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const content = await getPublicContent().catch(() => null);
  if (!content) return new Response("Sitemap temporarily unavailable", {status: 503, headers: {"Cache-Control":"no-store","Retry-After":"60"}});
  const sitemapVehicles = content.vehicles.map((vehicle) => ({
    slug: vehicle.slug,
    updatedAt: content.updatedAt,
  }));
  const xml = renderSitemapXml(
    buildSitemapEntries(sitemapVehicles),
    getPublicSiteUrl(content.settings),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate",
    },
  });
}
