/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { contact, getVehicle, vehicles } from "@/lib/vehicles";

export function generateStaticParams(){ return vehicles.map(vehicle=>({slug:vehicle.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{ const {slug}=await params; const vehicle=getVehicle(slug); return vehicle?{title:`${vehicle.name} | Chida Moore Automobiles`,description:`View photos and enquire about the ${vehicle.name}.`}:{title:"Vehicle not found"}; }

export default async function VehiclePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const vehicle=getVehicle(slug); if(!vehicle) notFound();
  const subject=encodeURIComponent(`Enquiry about ${vehicle.name}`); const message=encodeURIComponent(`Hello, I am interested in the ${vehicle.name}. Please share the current price and details.`);
  return <main className="inner-page vehicle-page" id="main-content"><SiteHeader />
    <div className="breadcrumb"><a href="/">Home</a><span>/</span><a href="/#inventory">Inventory</a><span>/</span><strong>{vehicle.name}</strong></div>
    <section className="vehicle-overview"><VehicleGallery vehicle={vehicle}/><aside className="vehicle-panel"><p className="section-kicker">{vehicle.make}</p><h1>{vehicle.name}</h1><span className="detail-availability">{vehicle.availability}</span><div className="vehicle-price"><small>Price</small><strong>{vehicle.price}</strong></div><dl><div><dt>Make</dt><dd>{vehicle.make}</dd></div>{vehicle.year&&<div><dt>Model year</dt><dd>{vehicle.year}</dd></div>}<div><dt>Inspection</dt><dd>Subject to confirmation</dd></div><div><dt>More details</dt><dd>Ask the sales team</dd></div></dl><a className="gold-button detail-whatsapp" href={`${contact.whatsapp[0].href}?text=${message}`} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/> Enquire on WhatsApp</a><p className="detail-note">Prices and inspection arrangements are confirmed directly by the sales team.</p></aside></section>
    <section className="vehicle-contact"><div><p className="section-kicker">Vehicle enquiry</p><h2>Ask about the {vehicle.name}.</h2></div><div><a href={`${contact.whatsapp[1].href}?text=${message}`} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/>WhatsApp {contact.whatsapp[1].display}</a><a href={contact.phones[2].href}><Phone aria-hidden="true"/>Call {contact.phones[2].display}</a><a href={`mailto:${contact.emails[1]}?subject=${subject}`}><Mail aria-hidden="true"/>{contact.emails[1]}</a></div></section>
    <footer className="site-footer"><a className="wordmark footer-brand" href="/"><span>CHIDA MOORE</span><small>AUTOMOBILES</small></a><p>{vehicle.name}</p><nav aria-label="Footer navigation"><a href="/#inventory">Inventory</a><a href="/about">About</a><a href="/#contact">Contact</a></nav><small>© 2026 Chida Moore Automobiles.</small></footer>
  </main>;
}
