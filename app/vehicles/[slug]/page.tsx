import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { getPublicContent } from "@/lib/cms/store";
import { getPublicSiteUrl,pageMetadata,serializeJsonLd,vehicleJsonLd } from "@/lib/seo";
import { EnquiryLink } from "@/components/enquiry-link";

export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const {vehicles,settings}=await getPublicContent();const vehicle=vehicles.find(v=>v.slug===slug);return vehicle?pageMetadata(`/vehicles/${slug}`,`${vehicle.name} | Chida Moore Automobiles`,vehicle.description||`View ${vehicle.name} photos, price and sales information.`,vehicle.featuredImage??vehicle.image,getPublicSiteUrl(settings)):{title:"Vehicle not found",robots:{index:false}};}

export default async function VehiclePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const {vehicles,settings}=await getPublicContent();const contact=settings.contact;const vehicle=vehicles.find(v=>v.slug===slug);if(!vehicle)notFound();
  const subject=encodeURIComponent(`Enquiry about ${vehicle.name}`); const message=encodeURIComponent(`Hello, I am interested in the ${vehicle.name}. Please share the current price and details.`);
  return <main className="inner-page vehicle-page" id="main-content"><SiteHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(vehicleJsonLd(vehicle,getPublicSiteUrl(settings)))}}/>
    <header className="reference-product-title"><p className="section-kicker">Explore every view</p><h1>{vehicle.name}</h1><p>Select any available image to display it in the centre.</p></header>
    <section className="vehicle-overview"><VehicleGallery vehicle={vehicle}/><aside className="vehicle-panel"><p className="section-kicker">Sales information</p><h2>{vehicle.name}</h2><span className="detail-availability">{vehicle.availability}</span><div className="vehicle-price"><small>Price</small><strong>{vehicle.price}</strong></div>{vehicle.description&&<p>{vehicle.description}</p>}<dl><div><dt>Make</dt><dd>{vehicle.make}</dd></div><div><dt>Condition</dt><dd>{vehicle.condition}</dd></div><div><dt>Model year</dt><dd>{vehicle.year}</dd></div><div><dt>Inspection</dt><dd>Subject to confirmation</dd></div>{vehicle.specifications.map(spec=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><EnquiryLink className="gold-button detail-whatsapp" type="Sales" vehicleSlug={vehicle.slug} message={decodeURIComponent(message)} href={`${contact.whatsapp[0].href}?text=${message}`}><MessageCircle aria-hidden="true"/> Enquire on WhatsApp</EnquiryLink><p className="detail-note">Prices and inspection arrangements are confirmed directly by the sales team.</p></aside></section>
    {vehicle.videos.length>0&&<section className="content-width vehicle-videos"><h2>Vehicle videos</h2>{vehicle.videos.map(src=><video key={src} src={src} controls preload="metadata" playsInline aria-label={`Video of ${vehicle.name}`}/>)}</section>}
    <section className="vehicle-contact"><div><p className="section-kicker">Vehicle enquiry</p><h2>Ask about the {vehicle.name}.</h2></div><div><a href={`${contact.whatsapp[1].href}?text=${message}`} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/>WhatsApp {contact.whatsapp[1].display}</a><a href={contact.phones[2].href}><Phone aria-hidden="true"/>Call {contact.phones[2].display}</a><a href={`mailto:${contact.emails[1]}?subject=${subject}`}><Mail aria-hidden="true"/>{contact.emails[1]}</a></div></section>
    <SiteFooter />
  </main>;
}
