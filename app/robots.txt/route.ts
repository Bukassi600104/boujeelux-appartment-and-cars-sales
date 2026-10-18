import { getPublicContent } from "@/lib/cms/store";
import { getPublicSiteUrl, renderRobotsTxt } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const content = await getPublicContent().catch(() => null);
  if (!content) return new Response("Robots configuration temporarily unavailable", {status:503,headers:{"Cache-Control":"no-store","Retry-After":"60"}});
  return new Response(renderRobotsTxt(getPublicSiteUrl(content.settings)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate",
    },
  });
}
