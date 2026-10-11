/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
import type { Metadata } from "next";
import { AtSign, Mail, MessageCircle, Phone } from "lucide-react";
import { AboutHero } from "@/components/service-heroes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { contact } from "@/lib/vehicles";

export const metadata: Metadata = { title:"About | Chida Moore Automobiles", description:"Learn about Chida Moore Automobiles and contact our vehicle sales team." };

export default function AboutPage(){
  return <main className="inner-page" id="main-content"><SiteHeader />
    <AboutHero />
    <section className="about-principles"><header><p className="section-kicker">Our approach</p><h2>Considered at every step.</h2></header><div className="value-list"><article><h3>Selection</h3><p>A focused collection of vehicles shown with the images and information available to us.</p></article><article><h3>Clarity</h3><p>Direct answers, clear vehicle information and inspection arrangements confirmed per vehicle.</p></article><article><h3>Personal service</h3><p>A sales conversation shaped around the vehicle you want and the next step you are ready to take.</p></article></div></section>
    <section className="about-services"><div><p className="section-kicker">How we help</p><h2>Available stock and tailored sourcing.</h2></div><div><article><h3>Available inventory</h3><p>Browse the current selection, open each vehicle page and review its real gallery before contacting the team.</p></article><article><h3>Vehicle sourcing</h3><p>Tell us the make, model and preferences you have in mind. We can help you explore suitable options beyond the current collection.</p></article></div></section>
    <section className="contact-directory" aria-labelledby="contact-heading"><div><p className="section-kicker">Contact</p><h2 id="contact-heading">Speak with the team.</h2><p>Call, WhatsApp or email Chida Moore Automobiles about an available vehicle or sourcing request.</p></div><div className="contact-grid">
      <div><Phone aria-hidden="true"/><h3>Call</h3>{contact.phones.map(item=><a href={item.href} key={item.href}>{item.display}</a>)}</div>
      <div><MessageCircle aria-hidden="true"/><h3>WhatsApp</h3>{contact.whatsapp.map(item=><a href={item.href} target="_blank" rel="noopener noreferrer" key={item.href}>{item.display}</a>)}</div>
      <div><Mail aria-hidden="true"/><h3>Email</h3>{contact.emails.map(email=><a href={`mailto:${email}`} key={email}>{email}</a>)}</div>
      <div><AtSign aria-hidden="true"/><h3>Instagram</h3><a href={contact.instagram} target="_blank" rel="noopener noreferrer">@Boujeelux24</a></div>
    </div></section>
    <SiteFooter />
  </main>;
}
