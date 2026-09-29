"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const choose = (index: number) => { const next = (index + vehicle.gallery.length) % vehicle.gallery.length; setSelected(next); refs.current[next]?.scrollIntoView({ block:"nearest", inline:"center", behavior:"smooth" }); };
  const onKey = (event: React.KeyboardEvent, index: number) => { let next = index; if (event.key === "ArrowRight") next = index + 1; else if (event.key === "ArrowLeft") next = index - 1; else if (event.key === "Home") next = 0; else if (event.key === "End") next = vehicle.gallery.length - 1; else return; event.preventDefault(); choose(next); refs.current[(next + vehicle.gallery.length) % vehicle.gallery.length]?.focus(); };
  const active = vehicle.gallery[selected];
  return <section className="product-gallery" aria-label={`${vehicle.name} image gallery`}>
    <div className="gallery-stage"><span className="gallery-watermark" aria-hidden="true">{vehicle.make}</span><img src={active.src} alt={active.alt} /><span className="gallery-shadow" aria-hidden="true" /><div className="gallery-count" aria-live="polite">{selected + 1} / {vehicle.gallery.length}</div><button className="gallery-prev" type="button" onClick={() => choose(selected - 1)} aria-label="Previous vehicle image"><ChevronLeft aria-hidden="true" /></button><button className="gallery-next" type="button" onClick={() => choose(selected + 1)} aria-label="Next vehicle image"><ChevronRight aria-hidden="true" /></button></div>
    <div className="gallery-thumbnails" role="tablist" aria-label="Choose vehicle image">{vehicle.gallery.map((image,index)=><button key={image.src} ref={node => { refs.current[index]=node; }} type="button" role="tab" aria-selected={selected===index} aria-label={`View ${image.label} of ${vehicle.name}`} onClick={()=>choose(index)} onKeyDown={event=>onKey(event,index)}><img src={image.src} alt="" /></button>)}</div>
  </section>;
}
