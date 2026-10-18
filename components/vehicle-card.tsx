"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/vehicles";
import { cabinPreviews, featuredScenes } from "@/lib/featured-scenes";
import { galleryPhoto } from "@/lib/gallery-photos";
import { SafeImage } from "@/components/safe-image";

export function VehicleCard({ vehicle, variant = "collection" }: { vehicle: Vehicle; variant?: "collection" | "inventory" }) {
  const [cabin, setCabin] = useState(false);
  const scene = featuredScenes[vehicle.slug];
  const exterior = vehicle.featuredImage ?? scene?.src ?? vehicle.image;
  const interior = galleryPhoto(cabinPreviews[vehicle.slug] ?? vehicle.gallery.find(image => /cabin|interior/i.test(`${image.label} ${image.alt}`))?.src ?? vehicle.gallery[0]?.src ?? vehicle.image);
  const sizes = "(max-width:540px) 88vw, (max-width:820px) 46vw, 30vw";
  const photos = <>
    <SafeImage className="cinematic-photo" src={exterior} sizes={sizes} alt={`${vehicle.alt}${scene&&!vehicle.featuredImage ? ` in a cinematic ${scene.location}, Lagos setting` : ""}`} aria-hidden={cabin} width="1000" height="1250" loading="lazy" decoding="async" />
    <SafeImage className="cinematic-cabin" src={interior} sizes={sizes} alt={`Additional view of ${vehicle.name}`} aria-hidden={!cabin} width="1000" height="1250" loading="lazy" decoding="async" />
  </>;
  return <article className={`vehicle-card ${variant === "collection" ? "cinematic-card" : "inventory-preview-card"} ${cabin ? "shows-cabin" : ""}`}
    onPointerEnter={event => { if (event.pointerType === "mouse") setCabin(true); }}
    onPointerLeave={event => { if (event.pointerType === "mouse") setCabin(false); }}
    onFocus={event => { if (event.target instanceof HTMLAnchorElement) setCabin(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setCabin(false); }}>
    {variant === "collection" ? photos : <div className="card-image-stage">{photos}</div>}
    {variant === "collection" && <a className="card-link" href={`/vehicles/${vehicle.slug}`} aria-label={`Explore ${vehicle.name}`} />}
    <button className="card-preview-toggle" type="button" aria-label={`${cabin ? "Show exterior" : "Show front cabin"} of ${vehicle.name}`} aria-pressed={cabin} onClick={() => setCabin(current => !current)}>{cabin ? "Exterior ↗" : "View cabin ↗"}</button>
    <span className="cinematic-location">{cabin ? "Front cabin" : scene?.location ?? "Lagos"}</span>
    <div className="card-content"><div><p>{vehicle.make} · {vehicle.condition}</p><h3>{vehicle.name}</h3></div>{vehicle.availability!=="Available"&&<span className={`availability availability-${vehicle.availability.toLowerCase().replace(" ","-")}`}><i aria-hidden="true" /> {vehicle.availability}{vehicle.restockExpected?" · Available soon":""}</span>}<span className="card-price">{vehicle.price}</span><a className={variant === "inventory" ? "vehicle-card-link" : undefined} href={`/vehicles/${vehicle.slug}`} aria-label={`View details for ${vehicle.name}`}>View vehicle details <span aria-hidden="true">↗</span></a></div>
    <span className="sr-only">Hover, focus, or use the view button to preview this vehicle’s front cabin.</span>
  </article>;
}
