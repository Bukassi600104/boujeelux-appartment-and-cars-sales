"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Vehicle = { name: string; make: string; image: string; alt: string };

export function InventoryCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [position, setPosition] = useState(1);
  const update = useCallback(() => {
    const node = track.current;
    if (!node) return;
    setCanPrev(node.scrollLeft > 8);
    setCanNext(node.scrollLeft < node.scrollWidth - node.clientWidth - 8);
    const card = node.querySelector<HTMLElement>(".vehicle-card");
    const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 0;
    if (card) setPosition(Math.min(vehicles.length, Math.round(node.scrollLeft / (card.offsetWidth + gap)) + 1));
  }, [vehicles.length]);
  useEffect(() => { update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); }, [update]);
  const move = (direction: number) => { const node = track.current; const card = node?.querySelector<HTMLElement>(".vehicle-card"); if (node && card) { const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 0; node.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: "smooth" }); } };
  return <div className="carousel-shell">
    <div className="carousel-controls" aria-label="Vehicle carousel controls"><button type="button" onClick={() => move(-1)} disabled={!canPrev} aria-label="Previous vehicle" aria-controls="vehicle-carousel"><ChevronLeft aria-hidden="true" /></button><button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Next vehicle" aria-controls="vehicle-carousel"><ChevronRight aria-hidden="true" /></button></div>
    <div className="inventory-carousel" id="vehicle-carousel" ref={track} onScroll={update} onKeyDown={event => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} tabIndex={0} role="region" aria-label="Available vehicles">
      {vehicles.map((vehicle, index) => <article className="vehicle-card" key={vehicle.name}><div className="card-number" aria-hidden="true">0{index + 1}</div><div className="card-image-stage"><img src={vehicle.image} alt={vehicle.alt} width="1100" height="760" loading="lazy" /><span className="card-ground-shadow" aria-hidden="true" /></div><div className="card-content"><div><p>{vehicle.make}</p><h3>{vehicle.name}</h3></div><span className="availability"><i aria-hidden="true" /> Available</span><a href="#contact" aria-label={`View sales contact status for ${vehicle.name}`}>Sales contact details</a></div></article>)}
    </div><p className="sr-only" aria-live="polite">Vehicle {position} of {vehicles.length}</p>
  </div>;
}
