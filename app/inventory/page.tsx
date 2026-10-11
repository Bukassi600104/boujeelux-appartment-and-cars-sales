import type { Metadata } from "next";
import { InventoryList } from "@/components/inventory-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { vehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Vehicle Inventory | Chida Moore Automobiles",
  description: "Browse all available Tokunbo Lexus, Mercedes-Benz and Toyota vehicles from Chida Moore Automobiles.",
};

export default function InventoryPage() {
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
