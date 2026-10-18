"use client";


import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";
import { vehicleDisplayGallery } from "@/lib/vehicle-display-gallery";
import { galleryPosition, imageSources, imageVariant } from "@/lib/image-presentation";
import { SafeImage } from "@/components/safe-image";

const gallerySizes = "(max-width:820px) calc(100vw - 48px), (max-width:1336px) 52vw, 690px";

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const [selected, setSelected] = useState(()=>vehicleDisplayGallery(vehicle).coverIndex);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const warmed = useRef(new Set<string>());
  const gallery = useMemo(() => vehicleDisplayGallery(vehicle).photos,[vehicle]);
  const warm = (src: string) => {
    if (warmed.current.has(src)) return;
    warmed.current.add(src);
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.sizes = gallerySizes;
    image.srcset = imageSources(src);
    image.src = imageVariant(src, 960);
  };
  useEffect(() => {
    // One likely next view is enough; the whole album is not downloaded up front.
    const next = gallery[(selected + 1) % gallery.length];
    if(!next)return;
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.sizes = gallerySizes;
    image.srcset = imageSources(next.src);
    image.src = imageVariant(next.src, 960);
    warmed.current.add(next.src);
  }, [gallery, selected]);
  const choose = (index: number) => { const next = (index + vehicle.gallery.length) % vehicle.gallery.length; setSelected(next); refs.current[next]?.scrollIntoView({ block:"nearest", inline:"center", behavior:"smooth" }); };
  const onKey = (event: React.KeyboardEvent, index: number) => { let next = index; if (event.key === "ArrowRight") next = index + 1; else if (event.key === "ArrowLeft") next = index - 1; else if (event.key === "Home") next = 0; else if (event.key === "End") next = vehicle.gallery.length - 1; else return; event.preventDefault(); choose(next); refs.current[(next + vehicle.gallery.length) % vehicle.gallery.length]?.focus(); };
  const active = gallery[selected];
  if(!active)return <section className="product-gallery" aria-label={`${vehicle.name} image gallery`}><p>No photographs have been published for this vehicle.</p></section>;
  return <section className="product-gallery" aria-label={`${vehicle.name} image gallery`}>
    <div id="vehicle-image-panel" role="tabpanel" aria-label={active.label} className={`gallery-stage ${selected === 0 ? "gallery-stage--lead" : "gallery-stage--photo"}`}><div className="gallery-circle"><SafeImage key={active.src} src={active.src} sizes={gallerySizes} style={{ objectPosition: galleryPosition(active.src) }} alt={active.alt} width="1000" height="1250" decoding="async" fetchPriority="high" /></div><div className="sr-only" aria-live="polite">{selected + 1} / {gallery.length}</div><button className="gallery-prev" type="button" onClick={() => choose(selected - 1)} aria-label="Previous vehicle image"><ChevronLeft aria-hidden="true" /></button><button className="gallery-next" type="button" onClick={() => choose(selected + 1)} aria-label="Next vehicle image"><ChevronRight aria-hidden="true" /></button></div>
    <div className="gallery-thumbnails" role="tablist" aria-label="Choose vehicle image">{gallery.map((image,index)=><button key={image.src} ref={node => { refs.current[index]=node; }} type="button" role="tab" tabIndex={selected===index ? 0 : -1} aria-controls="vehicle-image-panel" aria-selected={selected===index} aria-label={`View ${image.label} of ${vehicle.name}`} onPointerEnter={()=>warm(image.src)} onFocus={()=>warm(image.src)} onClick={()=>choose(index)} onKeyDown={event=>onKey(event,index)}><SafeImage src={image.src} size="thumb" alt="" width="160" height="120" loading="lazy" decoding="async" /></button>)}</div>
  </section>;
}
