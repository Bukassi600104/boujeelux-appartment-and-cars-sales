"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Pause, Play } from "lucide-react";
import { imageSources, imageVariant } from "@/lib/image-presentation";

const interiors = [
  { model: "Lexus RX 350", src: "/vehicles/polished/2017-lexus-rx-350/cabin.webp", title: "Comfort, considered.", copy: "Think about the space you’ll spend time in. Share the colours, finishes and features that matter to you." },
  { model: "Mercedes-Benz GLE 53", src: "/vehicles/polished/mercedes-benz-gle/cabin.webp", title: "The details you live with.", copy: "From the driving position to the cabin’s finishes, start with the details you would love in your next car." },
  { model: "Toyota Corolla", src: "/vehicles/polished/2019-toyota-corolla/cabin.webp", title: "Your everyday, elevated.", copy: "A considered choice begins with how you use your car. Tell us what would make everyday driving feel right." },
  { model: "Mercedes-Benz GLE 350", src: "/vehicles/polished/2018-mercedes-benz-gle-350/cabin.webp", title: "A space that feels like yours.", copy: "Your vehicle brief can include the little things: seating, materials, comfort and the features you value most." },
];

export function SourcingHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [loaded, setLoaded] = useState<boolean[]>(interiors.map(() => false));
  const showcase = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    if (showcase.current) observer.observe(showcase.current);
    // Cached SSR images may finish before React attaches their load handlers.
    const images = showcase.current?.querySelectorAll<HTMLImageElement>(".source-interior-photo img");
    if (images) setLoaded(Array.from(images, image => image.complete && image.naturalWidth > 0));
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || !visible || hidden || reduced) return;
    const next = (active + 1) % interiors.length;
    if (!loaded[next]) return;
    const timer = window.setTimeout(() => setActive(next), 3000);
    return () => window.clearTimeout(timer);
  }, [active, paused, visible, hidden, reduced, loaded]);

  const selected = interiors[active];
  return <header className="sourcing-story-hero sourcing-interior-hero">
    <div className="content-width sourcing-story-title"><h1>The car you have in mind.<br /><em>The details that make it yours.</em></h1><div><p>A specific model. A considered budget. The little things you won’t compromise on. Let’s give your next car a clear direction.</p><a className="text-link" href="#vehicle-brief">Shape your search <ArrowDown size={17} aria-hidden="true" /></a></div></div>
    <div className="source-interior-showcase content-width" ref={showcase} role="region" aria-roledescription="carousel" aria-label="Interior inspiration" data-playback={paused ? "paused" : !visible ? "out-of-view" : hidden ? "hidden" : reduced ? "reduced-motion" : !loaded[(active + 1) % interiors.length] ? "loading" : "playing"}
      onFocusCapture={event => { if (!(event.target as Element).closest(".source-interior-controls")) setPaused(true); }}>
      <div className="source-interior-photo">{interiors.map((interior, index) => <img key={interior.src} className={active === index ? "is-active" : undefined} src={imageVariant(interior.src, 960)} srcSet={imageSources(interior.src)} sizes="(max-width:820px) calc(100vw - 48px), 65vw" alt={active === index ? `${interior.model} front cabin` : ""} aria-hidden={active !== index} width="960" height="1280" decoding="async" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "low"} onLoad={() => setLoaded(current => current.map((value, position) => position === index ? true : value))} />)}<span className="source-interior-model">{selected.model}</span></div>
      <div className="source-interior-copy"><h2>{selected.title}</h2><p>{selected.copy}</p><div className="source-interior-options">{interiors.map((interior, index) => <button key={interior.model} type="button" aria-label={`View ${interior.model} interior`} aria-pressed={active === index} onClick={() => setActive(index)}><img src={imageVariant(interior.src, "thumb")} alt="" width="160" height="120" loading="lazy" decoding="async" /><span>{interior.model}</span></button>)}</div><div className="source-interior-controls"><span>Explore the cabin details.</span><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused || reduced ? "Play interior slideshow" : "Pause interior slideshow"} aria-pressed={paused} disabled={reduced}>{paused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button></div></div>
    </div>
  </header>;
}
