"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [["Home", "/"], ["Inventory", "/#inventory"], ["Sourcing", "/#sourcing"], ["About", "/about"], ["Contact", "/#contact"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (open && !menu.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey); window.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  return <header className="site-header"><a className="wordmark" href="/" aria-label="Chida Moore Automobiles home"><span>CHIDA MOORE</span><small>AUTOMOBILES</small></a><nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav><a className="nav-cta" href="/#contact">Sales enquiry</a><div className="mobile-nav" ref={menu}><button ref={trigger} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>{open && <nav id="mobile-menu" aria-label="Mobile navigation">{links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}</nav>}</div></header>;
}
