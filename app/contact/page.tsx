import type { Metadata } from "next";
import { AtSign, ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactHero } from "@/components/service-heroes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactEnquiry } from "@/components/contact-enquiry";
import { ScrollEntrances } from "@/components/scroll-entrances";
import { contact } from "@/lib/vehicles";

export const metadata: Metadata = { title: "Contact | Chida Moore Automobiles", description: "Contact Chida Moore Automobiles by WhatsApp, phone or email for vehicle enquiries, sourcing and inspection arrangements." };
export default function ContactPage() {
  return <main className="inner-page editorial-service-page" id="main-content"><SiteHeader /><ScrollEntrances />
    <ContactHero />
    <section className="service-page-section"><div className="content-width"><div className="contact-channel-grid"><article><MessageCircle size={26} strokeWidth={1.3} aria-hidden="true" /><h3>WhatsApp</h3><p>Share your questions and vehicle preferences directly.</p>{contact.whatsapp.map(item => <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{item.display}<ArrowUpRight size={15} aria-hidden="true" /></a>)}</article><article><Phone size={26} strokeWidth={1.3} aria-hidden="true" /><h3>Call the team</h3><p>Talk through your enquiry and the next step.</p>{contact.phones.map(item => <a key={item.href} href={item.href}>{item.display}<ArrowUpRight size={15} aria-hidden="true" /></a>)}</article><article><Mail size={26} strokeWidth={1.3} aria-hidden="true" /><h3>Email</h3><p>Send a detailed brief or a longer set of questions.</p>{contact.emails.map(email => <a key={email} href={`mailto:${email}`}>{email}<ArrowUpRight size={15} aria-hidden="true" /></a>)}</article><article><AtSign size={26} strokeWidth={1.3} aria-hidden="true" /><h3>Stay connected</h3><p>Explore our updates and continue the conversation.</p><a href={contact.instagram} target="_blank" rel="noopener noreferrer">@Boujeelux24<ArrowUpRight size={15} aria-hidden="true" /></a></article></div></div></section>
    <section className="service-page-section service-brief-section" id="enquiry"><div className="content-width"><ContactEnquiry /></div></section>
    <section className="service-page-section"><div className="content-width service-page-split"><div><h2>Planning to see a vehicle?</h2><p>Contact the team before making plans. Confirm the vehicle’s availability, viewing location and a suitable time for your visit.</p><a className="text-link" href="/inspection">Explore inspection arrangements <ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="service-faq"><details><summary>What should I include in my enquiry?</summary><p>Share the model you’re interested in, the questions you have and any timing preference. For sourcing, a budget and preferred specification help us understand your request.</p></details><details><summary>Can I contact you about a car that isn’t listed?</summary><p>Yes. Use the sourcing page to build your vehicle brief, or choose “Sourcing a car” in the message form above.</p></details><details><summary>Where will my inspection take place?</summary><p>The viewing location is confirmed with the team for the specific vehicle. Ask for the location and appointment details before travelling.</p></details></div></div></section><SiteFooter />
  </main>;
}
