/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
import type { Metadata } from "next";
import { AtSign, Mail, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { contact } from "@/lib/vehicles";

export const metadata: Metadata = { title:"About | Chida Moore Automobiles", description:"Learn about Chida Moore Automobiles and contact our vehicle sales team." };

export default function AboutPage(){
  return <main className="inner-page" id="main-content"><SiteHeader />
    <section className="about-hero"><div><p className="section-kicker">About Chida Moore Automobiles</p><h1>Premium vehicles.<br/>A personal approach.</h1><p>Chida Moore Automobiles is a dedicated vehicle sales experience built around a focused selection, thoughtful presentation and clear communication.</p><a className="gold-button" href="/#inventory">Explore available vehicles</a></div><div className="about-hero-visual"><span aria-hidden="true">CM</span><img src="/inventory/lexus-lx600.webp" alt="Dark grey Lexus LX 600 presented by Chida Moore Automobiles" /></div></section>
    <section className="about-principles"><header><p className="section-kicker">Our approach</p><h2>Considered at every step.</h2></header><div className="value-list"><article><span>01</span><h3>Selection</h3><p>A focused collection of vehicles shown with the images and information available to us.</p></article><article><span>02</span><h3>Clarity</h3><p>Direct answers, honest price-on-request labels and inspection arrangements confirmed per vehicle.</p></article><article><span>03</span><h3>Personal service</h3><p>A sales conversation shaped around the vehicle you want and the next step you are ready to take.</p></article></div></section>
    <section className="about-services"><div><p className="section-kicker">How we help</p><h2>Available stock and tailored sourcing.</h2></div><div><article><h3>Available inventory</h3><p>Browse the current selection, open each vehicle page and review its real gallery before contacting the team.</p></article><article><h3>Vehicle sourcing</h3><p>Tell us the make, model and preferences you have in mind. We can help you explore suitable options beyond the current collection.</p></article></div></section>
    <section className="contact-directory" aria-labelledby="contact-heading"><div><p className="section-kicker">Contact</p><h2 id="contact-heading">Speak with the team.</h2><p>Call, WhatsApp or email Chida Moore Automobiles about an available vehicle or sourcing request.</p></div><div className="contact-grid">
      <div><Phone aria-hidden="true"/><h3>Call</h3>{contact.phones.map(item=><a href={item.href} key={item.href}>{item.display}</a>)}</div>
      <div><MessageCircle aria-hidden="true"/><h3>WhatsApp</h3>{contact.whatsapp.map(item=><a href={item.href} target="_blank" rel="noopener noreferrer" key={item.href}>{item.display}</a>)}</div>
      <div><Mail aria-hidden="true"/><h3>Email</h3>{contact.emails.map(email=><a href={`mailto:${email}`} key={email}>{email}</a>)}</div>
      <div><AtSign aria-hidden="true"/><h3>Instagram</h3><a href={contact.instagram} target="_blank" rel="noopener noreferrer">@Boujeelux24</a></div>
    </div></section>
    <footer className="site-footer"><a className="wordmark footer-brand" href="/"><span>CHIDA MOORE</span><small>AUTOMOBILES</small></a><p>Premium motoring, personally selected.</p><nav aria-label="Footer navigation"><a href="/#inventory">Inventory</a><a href="/#sourcing">Sourcing</a><a href="/about">About</a><a href="/#contact">Contact</a></nav><small>© 2026 Chida Moore Automobiles.</small></footer>
  </main>;
}
