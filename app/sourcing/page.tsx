import type { Metadata } from "next";
import { ArrowUpRight, Search, SlidersHorizontal, MessagesSquare } from "lucide-react";
import { SourcingHero } from "@/components/sourcing-hero";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SourcingForm } from "@/components/sourcing-form";
import { ScrollEntrances } from "@/components/scroll-entrances";

export const metadata: Metadata = { title: "Vehicle Sourcing | Chida Moore Automobiles", description: "Create a personal vehicle brief, share your model and budget, and explore your next car with Chida Moore Automobiles." };

export default function SourcingPage() {
  return <main className="inner-page editorial-service-page" id="main-content"><SiteHeader /><ScrollEntrances />
    <SourcingHero />
    <section className="service-page-section"><div className="content-width"><div className="service-page-heading"><h2>Beyond the available collection.</h2><p>Sourcing starts when the right specification isn’t in front of you. Your brief gives our team a clear starting point for exploring suitable options with you.</p></div><div className="service-process-grid">{[
      [SlidersHorizontal, "Define what matters", "Share a make, model and comfortable budget. Add your preferred year, colour, features and the details that make the car right for your everyday life."],
      [Search, "Explore the possibilities", "Discuss suitable vehicles, availability and how closely the options match your brief. Decide where you’re flexible and what is essential."],
      [MessagesSquare, "Consider the next step", "Ask about the vehicle’s photographs, history and inspection arrangements. Confirm the details and costs directly before making a decision."],
    ].map(([Icon, title, copy]) => { const Symbol = Icon as typeof Search; return <article key={String(title)}><Symbol size={25} strokeWidth={1.3} aria-hidden="true" /><h3>{String(title)}</h3><p>{String(copy)}</p></article>; })}</div></div></section>
    <section className="service-page-section service-brief-section" id="vehicle-brief"><div className="content-width"><div className="service-page-heading"><h2>Let’s find your direction.</h2><p>Start with a model, then add the details. Your brief opens in WhatsApp for a personal conversation with our team.</p></div><SourcingForm /></div></section>
    <section className="service-page-section"><div className="content-width service-page-split"><div><h2>A little clarity goes a long way.</h2><p>A useful brief balances the vehicle you want with how you’ll use it. Think about passenger space, daily mileage and the features you value most.</p><a className="text-link" href="/inventory">Prefer something available now? <ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="service-faq">
      <details><summary>Can I request a model outside your collection?</summary><p>Yes. Enter your preferred make and model in the brief. The displayed vehicles are starting points; availability for any request is discussed with the team.</p></details>
      <details><summary>What if I haven’t chosen a model?</summary><p>Select Other, choose “Help me choose”, and describe your ideal vehicle or how you plan to use it in the model field. Add a budget and priorities if you have them.</p></details>
      <details><summary>How long will the search take?</summary><p>Timing depends on the specification and available options. Share any timing preference in your brief so the team can discuss what is realistic.</p></details>
      <details><summary>What costs should I discuss?</summary><p>Ask for the vehicle price and any applicable sourcing, inspection, delivery or other charges to be explained before agreeing to proceed. Costs are confirmed for your particular request.</p></details>
    </div></div></section><SiteFooter />
  </main>;
}
