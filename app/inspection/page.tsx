import type { Metadata } from "next";
import { InspectionHero } from "@/components/service-heroes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InspectionRequest } from "@/components/inspection-request";
import { ScrollEntrances } from "@/components/scroll-entrances";
import { getPublicContent } from "@/lib/cms/store";
import { getPublicSiteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicContent();
  return pageMetadata(
    "/inspection",
    "Vehicle Inspection | Chida Moore Automobiles",
    "Prepare for a closer look at a vehicle and discuss inspection arrangements with the Chida Moore Automobiles team.",
    settings.heroImage,
    getPublicSiteUrl(settings),
  );
}
export default function InspectionPage() {
  return <main className="inner-page editorial-service-page" id="main-content"><SiteHeader /><ScrollEntrances />
    <InspectionHero />
    <section className="service-page-section"><div className="content-width service-page-split"><div><h2>Know what you want to look at.</h2><p>Use these prompts to prepare your questions. The scope of a viewing, test drive or independent inspection should be agreed with the team for the specific vehicle.</p></div><div className="service-faq">
      <details open><summary>Exterior & tyres</summary><p>Look at panel alignment, paint finish, glass and tyre condition. Ask about any visible repairs or damage and anything the photographs don’t show clearly.</p></details>
      <details><summary>Cabin & equipment</summary><p>Review the seats, trim, controls, air conditioning and electronic features. Ask which equipment is fitted and how it can be checked during a viewing.</p></details>
      <details><summary>Mechanical condition & driving</summary><p>Discuss warning lights, unusual sounds, fluids and available maintenance records. Confirm whether a test drive and an independent mechanic’s inspection can be arranged.</p></details>
      <details><summary>History & paperwork</summary><p>Ask for available service history and ownership or vehicle documents. Confirm the vehicle’s identity and the information available before deciding to proceed.</p></details>
    </div></div></section>
    <section className="service-page-section service-brief-section" id="inspection-request"><div className="content-width"><div className="service-page-heading"><h2>Choose the car. Start the conversation.</h2><p>Availability, the viewing location and any inspection charges are confirmed directly with the team.</p></div><InspectionRequest /></div></section>
    <section className="service-page-section"><div className="content-width service-page-split"><div><h2>Before you make plans.</h2><p>A little preparation makes a viewing more useful. Review the vehicle gallery and bring the questions that matter to your decision.</p><div className="visit-checklist">{["I have reviewed the vehicle’s gallery.", "I know which details I want to discuss.", "I will confirm the location and time with the team."].map(label => <label key={label}><input type="checkbox" /><span>{label}</span></label>)}</div></div><div className="service-faq">
      <details><summary>Is my preferred date a booking?</summary><p>No. The request starts a conversation. Wait for the team to confirm the vehicle’s availability, location and appointment before travelling.</p></details>
      <details><summary>Can I bring my own mechanic?</summary><p>Ask the team about bringing an independent professional when arranging your visit. Access and the scope of any checks must be confirmed for the vehicle.</p></details>
      <details><summary>Can I arrange a test drive?</summary><p>Discuss test-drive availability and any requirements directly with the team. Arrangements are confirmed individually.</p></details>
    </div></div></section><SiteFooter />
  </main>;
}
