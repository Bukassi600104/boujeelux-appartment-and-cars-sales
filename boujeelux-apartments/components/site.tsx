'use client';

import Link from 'next/link';
import {MessageCircle, Menu, Phone} from 'lucide-react';
import {useEffect,useRef} from 'react';
import {contact} from '@/lib/domain';

const links=[['Apartments','/apartments'],['Our approach','/our-approach'],['Contact','/contact']] as const;

export function SiteHeader(){
  const mobileMenu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){mobileMenu.current?.removeAttribute('open');mobileMenu.current?.querySelector<HTMLElement>('summary')?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  const closeMenu=()=>mobileMenu.current?.removeAttribute('open');
  return <header className="site-header">
    <div className="container nav-wrap">
      <Link className="brand-logo" href="/" aria-label="Boujee Lux home"><img src="/brand/boujeelux-nav-transparent.png" alt=""/></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}<Link className="button nav-cta" href="/enquire">Plan your stay</Link></nav>
      <details className="mobile-nav" ref={mobileMenu}><summary aria-label="Open navigation"><Menu aria-hidden="true"/><span>Menu</span></summary><nav aria-label="Mobile navigation">{links.map(([label,href])=><Link href={href} key={href} onClick={closeMenu}>{label}</Link>)}<Link href="/enquire" onClick={closeMenu}>Plan your stay</Link></nav></details>
    </div>
  </header>;
}

export function SiteFooter(){
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Link className="brand-logo footer-logo" href="/" aria-label="Boujee Lux home"><img src="/brand/boujeelux-footer-transparent.png" alt=""/></Link><p>A considered place to stay in Egbeda, Lagos.</p></div>
      <div><p className="footer-title">Explore</p>{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}<Link href="/privacy">Privacy &amp; enquiries</Link></div>
      <div><p className="footer-title">Speak with us</p><a href={`tel:${contact.primary.replace(/\s/g,'')}`}><Phone aria-hidden="true"/> {contact.primary}</a><a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true"/> @{contact.instagram}</a></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Boujee Lux.</span><span>All stays are confirmed personally by the team.</span></div>
  </footer>;
}
