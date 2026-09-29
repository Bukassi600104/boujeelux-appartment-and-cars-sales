import { Check, MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import { InventoryCarousel, type Vehicle } from "@/components/inventory-carousel";
import { SiteHeader } from "@/components/site-header";

const makes = ["Lexus", "Mercedes-Benz", "Toyota"];
const inventory: Vehicle[] = [
  { name: "Lexus LX 600", make: "Lexus", image: "/inventory/lexus-lx600.webp", alt: "Front view of a dark grey Lexus LX 600" },
  { name: "2019 Toyota Corolla", make: "Toyota", image: "/inventory/toyota-corolla-2019.webp", alt: "Blue 2019 Toyota Corolla from the front side" },
  { name: "Mercedes-Benz GLE", make: "Mercedes-Benz", image: "/inventory/mercedes-gle-white.webp", alt: "White Mercedes-Benz GLE from the front side" },
  { name: "2017 Lexus RX 350", make: "Lexus", image: "/inventory/lexus-rx350-2017.webp", alt: "Black 2017 Lexus RX 350 from the front side" },
  { name: "2018 Mercedes-Benz GLE 350", make: "Mercedes-Benz", image: "/inventory/mercedes-gle-350.webp", alt: "Dark blue 2018 Mercedes-Benz GLE 350 from the rear side" },
  { name: "Lexus RX 350", make: "Lexus", image: "/inventory/lexus-rx350-blue.webp", alt: "Blue Lexus RX 350 from the front side" },
];

export default function Home() {
  return <main className="page-shell" id="home">
    <SiteHeader />
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-monogram" aria-hidden="true">CHIDA</div>
      <div className="hero-copy"><p className="eyebrow">Premium motoring, personally selected</p><h1 id="hero-title">Your Journey,<br />Your Car,<br />Your Way.</h1><p className="hero-description">Find the right vehicle for the way you live, drive and move.</p><a className="mobile-primary" href="#inventory">Browse vehicles</a></div>
      <div className="vehicle-visual"><div className="vehicle-meta left" aria-hidden="true"><strong>2017</strong><span>Model year</span></div><img src="/lexus-rx350-cutout.webp" alt="Front view of a black 2017 Lexus RX 350 with its headlights on" width="1278" height="1278" fetchPriority="high" /><div className="vehicle-shadow" aria-hidden="true" /></div>
      <aside className="hero-aside"><div className="vehicle-meta"><strong>RX 350</strong><span>Featured Lexus</span></div><div className="enquiry-note"><span className="gold-dot" aria-hidden="true" /><p>Interested in this vehicle?</p><small>Speak directly with our sales team.</small></div><a className="primary-cta" href="#contact">Start an enquiry</a></aside>
    </section>
    <section className="make-strip" id="makes" aria-label="Selected marques"><p>Selected marques</p><div className="make-list">{makes.map(make => <span key={make}>{make}</span>)}</div><a href="#sourcing">Source a vehicle <Search aria-hidden="true" size={17} /></a></section>

    <section className="inventory-section" id="inventory" aria-labelledby="inventory-title"><div className="inventory-inner"><header className="inventory-header"><div><p className="inventory-eyebrow">Available now</p><h2 id="inventory-title">Selected vehicles</h2></div><p>Explore a curated selection from our current inventory. Swipe or use the controls to browse.</p></header><InventoryCarousel vehicles={inventory} /></div></section>

    <section className="why-section" aria-labelledby="why-title"><div className="section-intro"><p className="section-kicker">The Chida Moore standard</p><h2 id="why-title">A more considered way to buy.</h2></div><div className="value-list"><article><Sparkles aria-hidden="true" /><span>01</span><h3>Carefully selected</h3><p>A focused collection, presented clearly so you can assess each vehicle with confidence.</p></article><article><ShieldCheck aria-hidden="true" /><span>02</span><h3>Clear guidance</h3><p>Useful vehicle details and straightforward answers throughout your decision.</p></article><article><MessageCircle aria-hidden="true" /><span>03</span><h3>Personal service</h3><p>Direct conversation with our sales team, from first enquiry to your next step.</p></article></div></section>

    <section className="sourcing-section" id="sourcing" aria-labelledby="sourcing-title"><div className="sourcing-visual"><span className="sourcing-mark" aria-hidden="true">SOURCE</span><img src="/inventory/mercedes-gle-white.webp" alt="White Mercedes-Benz GLE viewed from the front side" width="1100" height="760" loading="lazy" /><i aria-hidden="true" /></div><div className="sourcing-copy"><p className="section-kicker">Vehicle sourcing</p><h2 id="sourcing-title">Tell us what you are looking for.</h2><p>Looking beyond the current collection? Share your preferences and our team can help you explore suitable options.</p><ol><li><span>01</span><div><strong>Tell us what you need</strong><small>Share the make, model and key preferences.</small></div></li><li><span>02</span><div><strong>We search and shortlist</strong><small>We narrow the options around your request.</small></div></li><li><span>03</span><div><strong>You review and decide</strong><small>Consider the details before taking the next step.</small></div></li></ol><a className="gold-button" href="#contact">Start a sourcing enquiry</a></div></section>

    <section className="inspection-section" id="inspection" aria-labelledby="inspection-title"><div><p className="section-kicker">Inspection requests</p><h2 id="inspection-title">Clarity before commitment.</h2></div><div><p>Inspection arrangements are subject to confirmation for each vehicle. Ask our sales team about availability before making plans.</p><ul><li><Check aria-hidden="true" /> Choose a vehicle</li><li><Check aria-hidden="true" /> Request inspection details</li><li><Check aria-hidden="true" /> Confirm the arrangement</li></ul><a href="#contact">Ask about an inspection</a></div></section>

    <section className="about-section" id="about" aria-labelledby="about-title"><div className="about-monogram" aria-hidden="true">CM</div><div><p className="section-kicker">About Chida Moore</p><h2 id="about-title">Premium vehicles. A personal approach.</h2></div><div><p>Chida Moore Automobiles is a dedicated vehicle sales experience built around quality presentation, clear communication and a focused selection.</p><p>Whether you are choosing from available stock or asking us to source a particular vehicle, the experience stays direct and considered.</p></div></section>

    <section className="contact-section" id="contact" aria-labelledby="contact-title"><p className="section-kicker">Sales enquiries</p><h2 id="contact-title">Ready to discuss a vehicle?</h2><p>Tell us the vehicle you are interested in and our team will guide you through the next step.</p><div className="contact-action"><MessageCircle aria-hidden="true" /><div><strong>WhatsApp sales contact</strong><span>Contact number to be confirmed</span></div></div></section>

    <footer className="site-footer"><a className="wordmark footer-brand" href="#home"><span>CHIDA MOORE</span><small>AUTOMOBILES</small></a><p>Premium motoring, personally selected.</p><nav aria-label="Footer navigation"><a href="#inventory">Inventory</a><a href="#sourcing">Sourcing</a><a href="#inspection">Inspection</a><a href="#about">About</a></nav><small>© 2026 Chida Moore Automobiles.</small></footer>
  </main>;
}
