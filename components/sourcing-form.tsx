"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CarFront, Check, MapPin, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/cms-provider";
import { EnquiryLink } from "@/components/enquiry-link";
import { featuredScenes } from "@/lib/featured-scenes";
import { imageSources, imageVariant } from "@/lib/image-presentation";

const budgets = ["Under ₦30m", "₦30m – ₦60m", "₦60m – ₦100m", "Above ₦100m"];
const priorities = ["Low mileage", "Recent model", "Premium interior", "Family comfort", "Fuel economy", "Advanced safety"];
const ideas = [
  { model: "Lexus RX 350", type: "SUV", slug: "2017-lexus-rx-350" },
  { model: "Lexus NX 200t", type: "SUV", slug: "2014-lexus-nx-200t" },
  { model: "Lexus LX 600", type: "SUV", slug: "lexus-lx-600" },
  { model: "Toyota Corolla", type: "Sedan", slug: "2019-toyota-corolla" },
];
const findIdea = (value: string) => ideas.find(idea => idea.model.toLowerCase() === value.trim().toLowerCase());

export function SourcingForm() {
  const {contact,settings}=useSiteContent();
  const [step, setStep] = useState(1);
  const [model, setModel] = useState("");
  const [type, setType] = useState("SUV");
  const [otherStyle, setOtherStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const matchingIdea = findIdea(model);
  const preview = matchingIdea ?? (model.trim() ? undefined : ideas.find(idea => idea.type === type));
  const scene = preview ? featuredScenes[preview.slug] : undefined;
  const updateModel = (value: string) => {
    setModel(value);
    const idea = findIdea(value);
    if (idea) setType(idea.type);
  };
  const updateType = (value: string) => {
    setType(value);
    if (type !== value) setModel("");
  };
  const changeStep = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  };
  const vehicleStyle = type === "Other" ? otherStyle || "Other / open to guidance" : type;
  const message = ["Hello, I would like help sourcing a vehicle.", `Make and model: ${model.trim()}`, `Vehicle type: ${vehicleStyle}`, `Budget: ${budget.trim() || "Please discuss with me"}`, `Preferences: ${[...selected, preferences.trim()].filter(Boolean).join("; ") || "Please discuss with me"}`].join("\n");

  if (!settings.sourcingEnabled) return <div className="service-request-form" role="status"><h3>Vehicle sourcing is currently unavailable.</h3><p>Please browse the available inventory or contact the team for assistance.</p></div>;

  return <div className="sourcing-experience">
    <aside className="source-editorial" aria-label="Your personal vehicle search">
      {ideas.map(idea => <img key={idea.slug} className={`source-model-photo ${preview?.slug === idea.slug ? "is-active" : ""}`} src={imageVariant(featuredScenes[idea.slug].src, 960)} srcSet={imageSources(featuredScenes[idea.slug].src)} sizes="(max-width:820px) calc(100vw - 48px), 40vw" decoding="async" alt={preview?.slug === idea.slug ? `${idea.model} in a cinematic ${featuredScenes[idea.slug].location}, Lagos setting` : ""} aria-hidden={preview?.slug !== idea.slug} width="1000" height="1250" loading="lazy" />)}
      {!preview && <div className="source-custom-preview"><CarFront size={56} strokeWidth={1} aria-hidden="true" /><span>Your next car.<br /><em>Your own direction.</em></span></div>}
      <div className="source-image-top"><span>A search shaped around you</span><span>{scene ? <><MapPin size={12} aria-hidden="true" /> {scene.location}, Lagos</> : "Tailored to your brief"}</span></div>
      <div className="source-editorial-copy"><span className="source-overline">Personal vehicle sourcing</span><h3>Your preferences.<br /><em>Our attention.</em></h3><p>The right car begins with what matters to you.</p>
        <div className="source-live-brief"><span className="source-overline">Your search, taking shape</span><strong>{model.trim() || "A vehicle that feels like you"}</strong><div><span>{vehicleStyle}</span><span>{budget.trim() || "Budget open to discussion"}</span></div>{selected.length > 0 && <p>{selected.join(" · ")}</p>}</div>
        <small className="source-image-note">{preview ? `${preview.model} · Collection inspiration, not a confirmed match.` : "A personal search · Tell us your model and we’ll explore the options."}</small>
      </div>
    </aside>
    <form className="source-guided-form" onSubmit={event => {
      event.preventDefault();
      if (step === 1) changeStep(2);
    }}>
      <h3 ref={heading} tabIndex={-1}>{step === 1 ? "What would you love to drive?" : "Make the search yours."}</h3><p className="source-form-intro">{step === 1 ? "Start with the car you have in mind. We’ll take it from there." : "A few details help us understand what matters most. These are optional."}</p>
      {step === 1 ? <div className="source-step">
        <fieldset><legend>Your preferred style</legend><div className="source-style-options">{["SUV", "Sedan", "Other"].map(item => <label key={item}><input type="radio" name="type" value={item} checked={type === item} onChange={() => updateType(item)} /><span><strong>{item}</strong><small>{item === "SUV" ? "Space & presence" : item === "Sedan" ? "Refined everyday driving" : "Something different"}</small></span></label>)}</div></fieldset>
        {type === "Other" && <><label htmlFor="source-other-style">What kind of vehicle? <span>Optional</span></label><select id="source-other-style" value={otherStyle} onChange={event => setOtherStyle(event.target.value)}><option value="">Help me choose</option>{["Coupe", "Hatchback", "Pickup", "MPV / people carrier", "Convertible", "Wagon"].map(item => <option key={item}>{item}</option>)}</select></>}
        <label htmlFor="source-model">Preferred make & model <span>Required</span></label><input id="source-model" name="model" value={model} onChange={event => updateModel(event.target.value)} placeholder={type === "SUV" ? "e.g. Lexus RX 350" : type === "Sedan" ? "e.g. Toyota Corolla" : "e.g. Ford Ranger or BMW 4 Series"} required pattern=".*\S.*" maxLength={120} />
        {type !== "Other" && <div className="source-model-suggestions"><span>Start with {type === "Sedan" ? "a sedan" : "an SUV"} from our collection</span>{ideas.filter(idea => idea.type === type).map(idea => <button key={idea.slug} type="button" aria-pressed={matchingIdea?.slug === idea.slug} onClick={() => updateModel(idea.model)}>{idea.model}<ArrowUpRight size={12} aria-hidden="true" /></button>)}</div>}
        <p className="source-field-note">{type === "Other" ? "Choose a style, then enter your model. Not sure? Describe what you need." : "These are starting points. You can enter any make and model."}</p>
      </div> : <div className="source-step">
        <label htmlFor="source-budget">Preferred budget <span>Optional</span></label><input id="source-budget" name="budget" value={budget} onChange={event => setBudget(event.target.value)} placeholder="Enter an amount, or choose a range" maxLength={100} /><div className="source-budget-options">{budgets.map(item => <button key={item} type="button" aria-pressed={budget === item} onClick={() => setBudget(budget === item ? "" : item)}>{item}</button>)}</div>
        <fieldset><legend>What matters most? <span>Choose any</span></legend><div className="source-priorities">{priorities.map(item => <button key={item} type="button" aria-pressed={selected.includes(item)} onClick={() => setSelected(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item])}>{selected.includes(item) && <Check size={12} aria-hidden="true" />}{item}</button>)}</div></fieldset><p className="source-field-note">Choose what matters to you. Add any specific requirements below.</p>
        <label htmlFor="source-preferences">Anything else? <span>Optional</span></label><textarea id="source-preferences" name="preferences" value={preferences} onChange={event => setPreferences(event.target.value)} placeholder="Preferred year, colour, features or a specific detail…" rows={2} maxLength={500} />
      </div>}
      <div className="source-form-bottom">{step === 1 ? <button className="gold-button" type="submit">Fine-tune my search <ArrowRight size={17} aria-hidden="true" /></button> : <><button className="source-back" type="button" onClick={() => changeStep(1)}><ArrowLeft size={15} aria-hidden="true" /> Back</button><EnquiryLink className="gold-button" href={`${contact.whatsapp[0].href}?text=${encodeURIComponent(message)}`} message={message} type="Sourcing"><MessageCircle size={16} aria-hidden="true" /> Review on WhatsApp <ArrowUpRight size={16} aria-hidden="true" /></EnquiryLink></>}
        <p>{step === 1 ? "Two simple steps. A conversation tailored to you." : "Your brief opens in WhatsApp. Review it before you send."}</p>
      </div>
    </form>
  </div>;
}
