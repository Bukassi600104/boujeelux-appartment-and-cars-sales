"use client";
/* eslint-disable @next/next/no-img-element */

import {useEffect,useMemo,useState,useSyncExternalStore} from "react";
import {usePathname} from "next/navigation";
import {MessageCircle,X} from "lucide-react";
import type {Vehicle} from "@/lib/vehicles";
import {chatClickContext,dismissWhatsappReminder,parseRecentVehicles,rememberVehicle,shouldShowWhatsappReminder} from "@/lib/cms/refinements";

const recentKey="chida-recent-vehicles";
const recentEvent="chida-recent-vehicles-change";
const subscribeRecent=(notify:()=>void)=>{const storage=(event:StorageEvent)=>{if(event.key===recentKey)notify();};window.addEventListener("storage",storage);window.addEventListener(recentEvent,notify);return()=>{window.removeEventListener("storage",storage);window.removeEventListener(recentEvent,notify);};};
const recentSnapshot=()=>{try{return localStorage.getItem(recentKey)??"[]";}catch{return "[]";}};
const serverRecentSnapshot=()=>"[]";
const reminderStore=()=>({get:(key:string)=>sessionStorage.getItem(key),set:(key:string,value:string)=>sessionStorage.setItem(key,value)});

function recordChat(listingSlug:string){
  const body=JSON.stringify({listingSlug});
  try{
    if(navigator.sendBeacon?.("/api/chat-clicks",new Blob([body],{type:"application/json"})))return;
    void fetch("/api/chat-clicks",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}).catch(()=>undefined);
  }catch{}
}

export function RecentlyViewed({vehicles,current}:{vehicles:Vehicle[];current:string}){
  const raw=useSyncExternalStore(subscribeRecent,recentSnapshot,serverRecentSnapshot);
  const published=useMemo(()=>vehicles.map(vehicle=>vehicle.slug),[vehicles]);
  const slugs=useMemo(()=>parseRecentVehicles(raw,published,current),[raw,published,current]);

  useEffect(()=>{
    const next=JSON.stringify(rememberVehicle(recentSnapshot(),current));
    try{localStorage.setItem(recentKey,next);window.dispatchEvent(new Event(recentEvent));}catch{}
  },[current]);

  const recent=slugs.map(slug=>vehicles.find(vehicle=>vehicle.slug===slug)).filter((vehicle):vehicle is Vehicle=>Boolean(vehicle));
  if(!recent.length)return null;

  return <section className="recently-viewed" aria-labelledby="recently-viewed-title">
    <div className="recently-viewed-heading"><div><span className="eyebrow">Your shortlist</span><h2 id="recently-viewed-title">Recently viewed</h2></div><button type="button" className="text-button" onClick={()=>{try{localStorage.removeItem(recentKey);window.dispatchEvent(new Event(recentEvent));}catch{}}}>Clear</button></div>
    <div className="recently-viewed-grid">{recent.map(vehicle=><a href={"/vehicles/"+vehicle.slug} key={vehicle.slug} className="recent-vehicle"><img src={vehicle.image} alt="" /><span><strong>{vehicle.name}</strong><small>{vehicle.price}</small>{(vehicle.availability==="Sold"||vehicle.availability==="Unavailable")&&<small>{vehicle.availability}{vehicle.restockExpected?" · Restock expected":""}</small>}</span></a>)}</div>
  </section>;
}

export function PublicChatTracker({vehicles}:{vehicles:Vehicle[]}){
  const pathname=usePathname();
  const published=useMemo(()=>vehicles.map(vehicle=>vehicle.slug),[vehicles]);

  useEffect(()=>{
    if(pathname.startsWith("/admin"))return;
    const handleClick=(event:MouseEvent)=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const anchor=target.closest<HTMLAnchorElement>("a[href]");
      if(!anchor)return;
      const listingSlug=chatClickContext(anchor.href,pathname,published);
      if(listingSlug!==null)recordChat(listingSlug);
    };
    document.addEventListener("click",handleClick);
    return()=>document.removeEventListener("click",handleClick);
  },[pathname,published]);

  return null;
}

export function WhatsappAssistant({vehicles,href:whatsappHref}:{vehicles:Vehicle[];href:string}){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(pathname.startsWith("/admin")||!shouldShowWhatsappReminder(reminderStore()))return;
    const timer=window.setTimeout(()=>{
      dismissWhatsappReminder(reminderStore());
      setOpen(true);
    },6500);
    return()=>window.clearTimeout(timer);
  },[pathname]);

  if(pathname.startsWith("/admin"))return null;
  const match=pathname.match(/^\/vehicles\/([^/]+)\/?$/);
  const vehicle=match?vehicles.find(item=>item.slug===match[1]):undefined;
  const message=vehicle?`Hello Chida Moore Automobiles, I am interested in the ${vehicle.name}.`:"Hello Chida Moore Automobiles, I would like help finding a vehicle.";
  const href=`${whatsappHref}?text=${encodeURIComponent(message)}`;

  return <aside className={"whatsapp-assistant "+(open?"is-open":"")} aria-label="WhatsApp assistance">
    {open&&<div className="whatsapp-assistant-card"><button type="button" aria-label="Dismiss WhatsApp reminder" onClick={()=>setOpen(false)}><X aria-hidden="true" /></button><strong>Need help choosing?</strong><p>{vehicle?`Ask us about this ${vehicle.name}.`:"Chat with our team about sourcing, inspection or available vehicles."}</p><a href={href} target="_blank" rel="noreferrer">Continue on WhatsApp</a></div>}
    <a className="whatsapp-assistant-button" href={href} target="_blank" rel="noreferrer" aria-label="Chat with Chida Moore Automobiles on WhatsApp"><MessageCircle aria-hidden="true" /></a>
  </aside>;
}
