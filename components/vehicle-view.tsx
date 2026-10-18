import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleGallery } from "@/components/vehicle-gallery";
import type {CmsContent,CmsVehicle} from '@/lib/cms/model';
import { getPublicSiteUrl,serializeJsonLd,vehicleJsonLd } from "@/lib/seo";
import { EnquiryLink } from "@/components/enquiry-link";
import {RecentlyViewed} from "@/components/public-assistance";

export function VehicleView({snapshot,vehicle,preview=false}:{snapshot:CmsContent;vehicle:CmsVehicle;preview?:boolean}){
  const {vehicles,settings}=snapshot;const contact=settings.contact;
  const subject=encodeURIComponent(`Enquiry about ${vehicle.name}`); const message=encodeURIComponent(`Hello, I am interested in the ${vehicle.name}. Please share the current price and details.`);
  return <main className="inner-page vehicle-page" id="main-content"><SiteHeader />{!preview&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(vehicleJsonLd(vehicle,getPublicSiteUrl(settings)))}}/>}
    <header className="reference-product-title"><p className="section-kicker">Explore every view</p><h1>{vehicle.name}</h1><p>Select any available image to display it in the centre.</p></header>
    <section className="vehicle-overview"><VehicleGallery vehicle={vehicle}/><aside className="vehicle-panel"><p className="section-kicker">Sales information</p><h2>{vehicle.name}</h2>{vehicle.availability!=="Available"&&<span className="detail-availability">{vehicle.availability}{vehicle.restockExpected?" · Available soon":""}</span>}<div className="vehicle-price"><small>Price</small><strong>{vehicle.price}</strong></div>{vehicle.description&&<p>{vehicle.description}</p>}<dl><div><dt>Make</dt><dd>{vehicle.make}</dd></div><div><dt>Condition</dt><dd>{vehicle.condition}</dd></div><div><dt>Model year</dt><dd>{vehicle.year}</dd></div><div><dt>Inspection</dt><dd>Subject to confirmation</dd></div>{vehicle.specifications.map(spec=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><EnquiryLink className="gold-button detail-whatsapp" type="Sales" vehicleSlug={vehicle.slug} message={decodeURIComponent(message)} href={`${contact.whatsapp[0].href}?text=${message}`}><MessageCircle aria-hidden="true"/> {vehicle.availability==="Available"?"Enquire on WhatsApp":"Ask us to source a similar vehicle"}</EnquiryLink><p className="detail-note">{vehicle.availability==="Available"?"Prices and inspection arrangements are confirmed directly by the sales team.":"This vehicle is not currently available. We can discuss sourcing a similar vehicle; timing and specifications remain subject to confirmation."}</p></aside></section>
    {vehicle.videos.length>0&&<section className="content-width vehicle-videos"><h2>Vehicle videos</h2>{vehicle.videos.map(src=><video key={src} src={src} controls preload="metadata" playsInline aria-label={`Video of ${vehicle.name}`}/>)}</section>}
    {!preview&&<RecentlyViewed current={vehicle.slug} vehicles={vehicles}/>}<section className="vehicle-contact"><div><p className="section-kicker">Vehicle enquiry</p><h2>Ask about the {vehicle.name}.</h2></div><div><a href={`${contact.whatsapp[1].href}?text=${message}`} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/>WhatsApp {contact.whatsapp[1].display}</a><a href={contact.phones[2].href}><Phone aria-hidden="true"/>Call {contact.phones[2].display}</a><a href={`mailto:${contact.emails[1]}?subject=${subject}`}><Mail aria-hidden="true"/>{contact.emails[1]}</a></div></section>
    <SiteFooter />
  </main>;
}
