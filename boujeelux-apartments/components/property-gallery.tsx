'use client';

import Image from 'next/image';
import {useLayoutEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Expand,X} from 'lucide-react';
import {propertyPhotos} from '@/lib/property-photos';

const categories=['All spaces','Living areas','Bedrooms','Kitchens','Bathrooms','Outdoors'] as const;

export function PropertyGallery(){
  const [category,setCategory]=useState<string>('All spaces');
  const [selected,setSelected]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const track=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{track.current?.scrollTo({left:0,behavior:'instant'});},[category]);
  const shown=propertyPhotos.filter(p=>category==='All spaces'||p.category===category);
  const photo=selected===null?null:propertyPhotos[selected];
  const open=(id:number)=>{setSelected(id-1);dialog.current?.showModal();};
  const move=(direction:number)=>setSelected(index=>{
    if(index===null||shown.length===0)return null;
    const position=shown.findIndex(p=>p.id===index+1);
    return shown[(position+direction+shown.length)%shown.length].id-1;
  });
  const scroll=(direction:number)=>track.current?.scrollBy({left:direction*track.current.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});

  return <section className="section property-collection" id="property-gallery" aria-labelledby="property-gallery-title">
    <div className="container">
      <div className="section-heading"><div><p className="eyebrow">The property, in detail</p><h2 id="property-gallery-title">A closer look at Boujee Lux.</h2><p className="collection-note">Twenty individual views supplied by Boujeelux. Confirm the rooms and facilities included in your chosen apartment with our team.</p></div><div className="gallery-controls"><button type="button" className="gallery-control" aria-label="Scroll photos left" onClick={()=>scroll(-1)}><ArrowLeft aria-hidden="true"/></button><button type="button" className="gallery-control" aria-label="Scroll photos right" onClick={()=>scroll(1)}><ArrowRight aria-hidden="true"/></button></div></div>
      <div className="photo-filters" role="group" aria-label="Filter property photographs">{categories.map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div>
      <div className="property-photo-track" ref={track} tabIndex={0} aria-label={`${category} photographs. Scroll horizontally or select a photograph to enlarge.`}>
        {shown.map(p=><button type="button" className="property-photo" key={p.id} data-property-photo={p.id} onClick={()=>open(p.id)} aria-label={`Enlarge ${p.category.toLowerCase()}: ${p.caption.toLowerCase()}`}><span className="property-photo-image"><Image src={p.src} alt="" fill sizes="(max-width: 620px) 72vw, (max-width: 850px) 38vw, 260px"/><span className="photo-expand"><Expand aria-hidden="true"/></span></span><span className="property-photo-caption"><small>{p.category}</small><strong>{p.caption}</strong></span></button>)}
      </div>
      <p className="collection-footnote">Select any photograph to see the full view. Lighting and colour have been refined; these are not wider-room reconstructions.</p>
    </div>
    <dialog className="photo-dialog" ref={dialog} aria-label="Property photograph viewer" aria-labelledby={photo?'property-photo-title':undefined} onClose={()=>setSelected(null)} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}}}>
      {photo&&<div className="photo-dialog-content"><div className="photo-dialog-header"><div aria-live="polite" aria-atomic="true"><span>{photo.category} · {shown.findIndex(p=>p.id===photo.id)+1} / {shown.length}</span><h2 id="property-photo-title">{photo.caption}</h2></div><button type="button" className="gallery-control" aria-label="Close photograph" autoFocus onClick={()=>dialog.current?.close()}><X aria-hidden="true"/></button></div><figure><Image src={photo.src} alt={photo.alt} width={512} height={910} sizes="(max-width: 620px) 90vw, 50vw" loading="eager"/></figure><div className="photo-dialog-controls"><button type="button" onClick={()=>move(-1)}><ArrowLeft aria-hidden="true"/> Previous</button><span>Use ← → to explore</span><button type="button" onClick={()=>move(1)}>Next <ArrowRight aria-hidden="true"/></button></div></div>}
    </dialog>
  </section>;
}
