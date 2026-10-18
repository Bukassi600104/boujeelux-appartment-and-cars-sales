"use client";

import { useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/cms-provider";
import { EnquiryLink } from "@/components/enquiry-link";
import { SafeImage } from "@/components/safe-image";
import { featuredScenes } from "@/lib/featured-scenes";

export function InspectionRequest() {
  const {contact,vehicles,settings}=useSiteContent();
  const [slug, setSlug] = useState(vehicles[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const [questions, setQuestions] = useState("");
  const vehicle = vehicles.find(item => item.slug === slug) ?? vehicles[0];
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(part => [part.type, part.value]));
  const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  if (!settings.inspectionEnabled) return <div className="service-request-form" role="status"><h3>Inspection requests are currently unavailable.</h3><p>Please contact the team directly if you have questions about a vehicle.</p></div>;
  if (vehicles.length === 0 || !vehicle) return <div className="service-request-form" role="status"><h3>No vehicles are available for inspection.</h3><p>Please check the inventory again soon or contact the team for assistance.</p></div>;
  const featuredScene = featuredScenes[slug];
  const previewSrc = vehicle.featuredImage ?? featuredScene?.src ?? vehicle.image;
  const usesFeaturedScene = !vehicle.featuredImage && !!featuredScene;
  const message = [`Hello, I would like to discuss an inspection of the ${vehicle.name}.`, `Preferred date: ${date || "Please discuss with me"}`, `Questions: ${questions.trim() || "Availability, location and inspection arrangements"}`, "Please confirm availability and arrangements before I make plans."].join("\n");
  return <div className="inspection-request-layout"><div className="request-vehicle-preview"><SafeImage src={previewSrc} size={960} sizes="(max-width:820px) calc(100vw - 48px), 40vw" decoding="async" alt={usesFeaturedScene ? `${vehicle.name} in a cinematic ${featuredScene.location}, Lagos setting` : vehicle.alt} width="1000" height="1250" loading="lazy" /><div><h3>{vehicle.name}</h3><a href={`/vehicles/${slug}`}>Explore the full gallery <ArrowUpRight size={15} aria-hidden="true" /></a></div></div><div className="service-request-form"><h3>A closer look starts here.</h3><p>Choose a vehicle and share a preferred date. Our team will confirm what is possible.</p><label htmlFor="inspection-vehicle">Vehicle</label><select id="inspection-vehicle" value={slug} onChange={event => setSlug(event.target.value)}>{vehicles.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select><label htmlFor="inspection-date">Preferred date <span>Optional</span></label><input id="inspection-date" type="date" min={today} value={date} onInput={event => setDate(event.currentTarget.value)} onChange={event => setDate(event.target.value)} /><label htmlFor="inspection-questions">What would you like to know? <span>Optional</span></label><textarea id="inspection-questions" rows={3} value={questions} onChange={event => setQuestions(event.target.value)} maxLength={700} placeholder="Condition, service records, test-drive arrangements, or anything you want to discuss…" /><EnquiryLink className="gold-button" href={`${contact.whatsapp[0].href}?text=${encodeURIComponent(message)}`} message={message} type="Inspection" vehicleSlug={vehicle.slug}><MessageCircle size={17} aria-hidden="true" /> Discuss my inspection <ArrowUpRight size={16} aria-hidden="true" /></EnquiryLink><small>This opens a WhatsApp draft. Your date is a preference, not a confirmed appointment.</small></div></div>;
}
