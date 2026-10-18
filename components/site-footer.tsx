"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Pre-optimized transparent WebP brand asset. */
import { useSiteContent } from "@/components/cms-provider";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter() {
  const {contact}=useSiteContent();
  const instagramName = new URL(contact.instagram).pathname.split("/").filter(Boolean)[0];
  return <footer className="site-footer"><div className="content-width">
    <div className="footer-invitation"><h2>Your next chapter, on the road.</h2><a href="/contact">Speak with our team <ArrowUpRight size={18} aria-hidden="true" /></a></div>
    <div className="footer-grid"><div className="footer-brand"><a className="wordmark" href="/"><img className="brand-logo brand-logo-footer" src="/brand/chida-moore-footer-transparent.webp" alt="Chida Moore Automobiles" width="1030" height="554" /></a><p>A considered collection.<br />A personal connection.</p></div><div><h3>Explore</h3><nav aria-label="Footer navigation"><a href="/inventory">The collection</a><a href="/sourcing">Vehicle sourcing</a><a href="/inspection">Inspection</a><a href="/about">Our approach</a><a href="/contact">Contact</a></nav></div><div><h3>Selected marques</h3><p>Lexus</p><p>Mercedes-Benz</p><p>Toyota</p><a className="footer-stock-link" href="/inventory">View available vehicles ↗</a></div><div><h3>Stay in touch</h3><a href={contact.phones[0].href}>{contact.phones[0].display}</a><a href={`mailto:${contact.emails[1]}`}>{contact.emails[1]}</a><a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram · @{instagramName}</a></div></div>
    <div className="footer-bottom"><span>© 2026 Chida Moore Automobiles.</span><span>Premium motoring, personally selected.</span></div>
  </div></footer>;
}
