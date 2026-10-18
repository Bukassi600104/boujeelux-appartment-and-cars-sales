"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Pre-optimized transparent WebP brand asset. */

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [["Home", "/"], ["Inventory", "/inventory"], ["Sourcing", "/sourcing"], ["Inspection", "/inspection"], ["About", "/about"], ["Contact", "/contact"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const active = pathname.startsWith("/vehicles/") ? "/inventory" : pathname.replace(/\/$/, "") || "/";
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (open && !menu.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey); window.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  return <header className="site-header"><a className="wordmark" href="/" aria-label="Chida Moore Automobiles home"><img className="brand-logo brand-logo-nav" src="/brand/chida-moore-nav-transparent.webp" alt="Chida Moore Automobiles" width="443" height="90" /></a><nav className="desktop-nav" aria-label="Primary navigation">{links.map(([label, href]) => <a href={href} key={href} className={active === href ? "active" : undefined} aria-current={active === href ? "page" : undefined}>{label}</a>)}</nav><a className="nav-cta" href="/contact">Sales enquiry</a><div className="mobile-nav" ref={menu}><button ref={trigger} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>{open && <nav id="mobile-menu" aria-label="Mobile navigation">{links.map(([label, href]) => <a href={href} key={href} className={active === href ? "active" : undefined} aria-current={active === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</a>)}</nav>}</div></header>;
}
