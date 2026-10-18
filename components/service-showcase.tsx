"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CarFront, FileText, MessageCircle, Search } from "lucide-react";
import { ServiceArt, StoryIcon } from "@/components/service-art";
import { useSiteContent } from "@/components/cms-provider";

const services = [
  { title: "Carefully selected vehicles", short: "The selection", icon: CarFront, heading: "A collection worth exploring.", copy: "Explore our available vehicles through their photographs and individual galleries. Find the model that feels right for your next journey.", detail: "Available vehicles · Individual galleries", link: "/inventory", action: "Explore the collection", scene: "selection" },
  { title: "Clear vehicle information", short: "The details", icon: FileText, heading: "The details. Clearly presented.", copy: "See the model, year, advertised price and available photographs together. Speak directly with our team to confirm the vehicle’s details and availability.", detail: "Model & year · Advertised pricing", link: "/inventory", action: "View vehicle information", scene: "clarity" },
  { title: "Inspection support", short: "A closer look", icon: Search, heading: "Confidence starts with a closer look.", copy: "Choose the vehicle you want to see, then ask our team about inspection arrangements. Availability and your visit are always subject to confirmation.", detail: "Inspection arrangements subject to confirmation", link: "/inspection", action: "Explore inspection support", scene: "inspection" },
  { title: "Direct WhatsApp assistance", short: "The conversation", icon: MessageCircle, heading: "Real questions. A personal conversation.", copy: "Share your preferences, ask about a vehicle or discuss your next step. Connect directly with our sales team on WhatsApp for personal guidance.", detail: "Your preferences · Direct sales assistance", link: "https://wa.me/2349118781995", action: "Start a conversation", scene: "conversation" },
] as const;

export function ServiceShowcase() {
  const {contact}=useSiteContent();
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { setInView(entry.isIntersecting); if (entry.isIntersecting) setEntered(true); }, { threshold: .18 });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  const service = services[active];
  return <section id="our-approach" ref={section} className={`service-showcase section-pad ${entered ? "is-revealed" : ""} ${inView ? "is-in-view" : ""}`} aria-labelledby="standard-heading">
    <div className="content-width">
      <header className="showcase-heading"><div><p className="section-kicker">The Chida Moore standard</p><h2 id="standard-heading">A considered approach<br /><em>to your next car.</em></h2></div><p>Thoughtful details.<br />Personal attention at every step.</p></header>
      <div className="showcase-layout">
        <div className="service-tabs" role="tablist" aria-label="Our approach">
          {services.map((item, index) => { return <button ref={node => { tabs.current[index] = node; }} type="button" key={item.scene} role="tab" id={`service-tab-${index}`} aria-selected={active === index} aria-controls="service-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
            let next = index;
            if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % services.length;
            else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + services.length - 1) % services.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = services.length - 1;
            else return;
            event.preventDefault(); setActive(next); tabs.current[next]?.focus();
          }}><span className="service-tab-icon"><StoryIcon scene={item.scene}/></span><span><small>{item.short}</small><strong>{item.title}</strong></span><ArrowUpRight className="service-tab-arrow" size={17} aria-hidden="true" /></button>; })}
        </div>
        <div className="service-panel" id="service-panel" role="tabpanel" aria-labelledby={`service-tab-${active}`} tabIndex={0}>
          <div className={`service-visual scene-${service.scene}`} key={`${service.scene}-${entered}`} aria-hidden="true">
            <ServiceArt scene={service.scene}/>
          </div>
          <div className="service-panel-copy" key={service.title}><p className="service-detail">{service.detail}</p><h3>{service.heading}</h3><p>{service.copy}</p><a href={service.scene==="conversation"?contact.whatsapp[0].href:service.link} {...(service.scene === "conversation" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{service.action}<ArrowUpRight size={18}/></a></div>
        </div>
      </div>
    </div>
  </section>;
}
