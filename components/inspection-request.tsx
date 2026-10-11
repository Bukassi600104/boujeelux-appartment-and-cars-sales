"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { contact, vehicles } from "@/lib/vehicles";
import { featuredScenes } from "@/lib/featured-scenes";
import { imageSources, imageVariant } from "@/lib/image-presentation";

export function InspectionRequest() {
  const [slug, setSlug] = useState(vehicles[0].slug);
  const [date, setDate] = useState("");
  const [questions, setQuestions] = useState("");
  const vehicle = vehicles.find(item => item.slug === slug)!;
  const scene = featuredScenes[slug];
  const message = [`Hello, I would like to discuss an inspection of the ${vehicle.name}.`, `Preferred date: ${date || "Please discuss with me"}`, `Questions: ${questions.trim() || "Availability, location and inspection arrangements"}`, "Please confirm availability and arrangements before I make plans."].join("\n");
  return <div className="inspection-request-layout"><div className="request-vehicle-preview"><img src={imageVariant(scene.src, 960)} srcSet={imageSources(scene.src)} sizes="(max-width:820px) calc(100vw - 48px), 40vw" decoding="async" alt={`${vehicle.name} in a cinematic ${scene.location}, Lagos setting`} width="1000" height="1250" loading="lazy" /><div><h3>{vehicle.name}</h3><a href={`/vehicles/${slug}`}>Explore the full gallery <ArrowUpRight size={15} aria-hidden="true" /></a></div></div><div className="service-request-form"><h3>A closer look starts here.</h3><p>Choose a vehicle and share a preferred date. Our team will confirm what is possible.</p><label htmlFor="inspection-vehicle">Vehicle</label><select id="inspection-vehicle" value={slug} onChange={event => setSlug(event.target.value)}>{vehicles.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select><label htmlFor="inspection-date">Preferred date <span>Optional</span></label><input id="inspection-date" type="date" value={date} onInput={event => setDate(event.currentTarget.value)} onChange={event => setDate(event.target.value)} /><label htmlFor="inspection-questions">What would you like to know? <span>Optional</span></label><textarea id="inspection-questions" rows={3} value={questions} onChange={event => setQuestions(event.target.value)} maxLength={700} placeholder="Condition, service records, test-drive arrangements, or anything you want to discuss…" /><a className="gold-button" href={`${contact.whatsapp[0].href}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" /> Discuss my inspection <ArrowUpRight size={16} aria-hidden="true" /></a><small>This opens a WhatsApp draft. Your date is a preference, not a confirmed appointment.</small></div></div>;
}
