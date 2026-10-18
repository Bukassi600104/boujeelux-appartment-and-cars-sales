import type { Metadata } from "next";
import { InventoryList } from "@/components/inventory-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicContent } from "@/lib/cms/store";
import { getPublicSiteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicContent();
  return pageMetadata(
    "/inventory",
    "Vehicle Inventory | Chida Moore Automobiles",
    "Browse the current published vehicle inventory from Chida Moore Automobiles, with available prices, photographs and vehicle details.",
    settings.heroImage,
    getPublicSiteUrl(settings),
  );
}

export default async function InventoryPage() {
  const { vehicles } = await getPublicContent();
  return <main className="inner-page inventory-page" id="main-content">
    <SiteHeader />
    <header className="inventory-page-hero">
      <div className="content-width">
        <p className="inventory-page-kicker">Available inventory</p>
        <h1>Find your next vehicle.</h1>
        <p className="inventory-page-intro">Browse all {vehicles.length} available Tokunbo vehicles, compare asking prices and open a vehicle to see its complete gallery.</p>
      </div>
    </header>
    <section className="inventory-inner" aria-label="Vehicle inventory">
      <InventoryList vehicles={vehicles} />
    </section>
    <SiteFooter />
  </main>;
}
