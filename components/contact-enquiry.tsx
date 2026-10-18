"use client";
import { useState } from "react";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/cms-provider";
import { EnquiryLink } from "@/components/enquiry-link";

const topics = ["A vehicle enquiry", "Sourcing a car", "An inspection", "Something else"];
const prompts: Record<string, string> = {
  "A vehicle enquiry": "Ask about a vehicle, its availability or the details you’d like to see.",
  "Sourcing a car": "Tell us your preferred model, budget and what matters most.",
  "An inspection": "Share the vehicle you want to see and any questions about arranging a visit.",
  "Something else": "Tell us how we can help. Start with a few details.",
};
export function ContactEnquiry() {
  const {contact,vehicles}=useSiteContent();
  const [topic, setTopic] = useState(topics[0]);
  const [vehicle, setVehicle] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const draft = [`Hello Chida Moore, ${name.trim() ? `my name is ${name.trim()}. ` : ""}I’m getting in touch about ${topic.toLowerCase()}.`, ...((topic === "A vehicle enquiry" || topic === "An inspection") && vehicle ? [`Vehicle: ${vehicle}`] : []), message.trim() || "Please help me with the next step."].join("\n");
  const enquiryType = topic === "An inspection" ? "Inspection" : topic === "Sourcing a car" ? "Sourcing" : "Sales";
  return <div className="contact-enquiry-layout"><div><h2>Let’s talk about<br /><em>your next step.</em></h2><p>Choose a subject and build a short message. Review it in WhatsApp or your email app before sending.</p><div className="contact-topic-options" aria-label="Enquiry subject">{topics.map(item => <button key={item} type="button" aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}<ArrowUpRight size={15} aria-hidden="true" /></button>)}</div></div><div className="service-request-form"><h3>{topic}</h3><p>{prompts[topic]}</p><label htmlFor="enquiry-name">Your name <span>Optional</span></label><input id="enquiry-name" value={name} onChange={event => setName(event.target.value)} placeholder="How should we address you?" maxLength={100} />{(topic === "A vehicle enquiry" || topic === "An inspection") && <><label htmlFor="enquiry-vehicle">Vehicle <span>Optional</span></label><select id="enquiry-vehicle" value={vehicle} onChange={event => setVehicle(event.target.value)}><option value="">I’m still exploring</option>{vehicles.map(item => <option key={item.slug}>{item.name}</option>)}</select></>}<label htmlFor="enquiry-message">Your message <span>Optional</span></label><textarea id="enquiry-message" rows={4} value={message} onChange={event => setMessage(event.target.value)} placeholder={prompts[topic]} maxLength={1000} /><div className="contact-draft-actions"><EnquiryLink className="gold-button" href={`${contact.whatsapp[0].href}?text=${encodeURIComponent(draft)}`} message={draft} type={enquiryType}><MessageCircle size={17} aria-hidden="true" /> Review on WhatsApp</EnquiryLink><a className="text-link" href={`mailto:${contact.emails[1]}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(draft)}`}><Mail size={17} aria-hidden="true" /> Open email draft</a></div></div></div>;
}
