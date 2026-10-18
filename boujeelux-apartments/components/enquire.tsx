'use client';

import Link from 'next/link';
import {useState, type FormEvent} from 'react';
import {useSearchParams} from 'next/navigation';
import {useApartments} from './catalog';
import {contact, enquiryText, todayISO, validateEnquiry, whatsappLink, type Enquiry} from '@/lib/domain';

export function Enquire() {
  const apartments = useApartments();
  const query = useSearchParams();
  const [form, setForm] = useState<Enquiry>(() => ({name:'', apartment:query.get('apartment') ?? '', arrival:'', departure:'', guests:'1', duration:'Daily', purpose:'Normal stay', notes:''}));
  const [errors, setErrors] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<{href:string; text:string}|null>(null);
  const apartment = apartments.find(a => a.slug === form.apartment);
  const update = (key:keyof Enquiry, value:string) => {setForm(current => ({...current, [key]:value})); setPrepared(null); setErrors([]);};
  function prepare(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {...form, apartment:apartment?.name ?? ''};
    const problems = validateEnquiry(payload, apartment?.maxGuests ?? null);
    if (apartment?.availability === 'Unavailable') problems.push('This apartment is unavailable. Please choose another option or contact the team.');
    const text = enquiryText(payload);
    const href = whatsappLink(contact.whatsapp, text);
    if (!href) problems.push('WhatsApp is unavailable. Please use the contact page.');
    setErrors(problems);
    setPrepared(problems.length || !href ? null : {href, text});
  }
  async function openWhatsApp(event:React.MouseEvent<HTMLAnchorElement>){event.preventDefault();if(!prepared)return;const preview=window.open('about:blank','_blank');if(preview)preview.opener=null;try{const response=await fetch('/api/cms/enquire',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload:{...form,apartment:apartment?.name??''},type:'Apartment'})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save enquiry.');if(preview)preview.location.href=prepared.href;else location.href=prepared.href;}catch(error){preview?.close();setErrors([error instanceof Error?error.message:'Could not save enquiry.']);}}
  return <main id="main-content" className="section"><div className="container">
    <header className="page-intro"><p className="eyebrow">A personal beginning</p><h1>Let’s plan your stay.</h1><p>Share your preferred apartment and dates. Our team will confirm availability, rates and the details with you.</p></header>
    <div className="form-grid enquiry-layout"><form className="panel" onSubmit={prepare}>
      <label className="field">Apartment<select required value={form.apartment} onChange={e => update('apartment', e.target.value)}><option value="">Choose your apartment</option>{apartments.map(a => <option key={a.id} value={a.slug} disabled={a.availability === 'Unavailable'}>{a.name}{a.availability === 'Unavailable' ? ' · Unavailable' : ''}</option>)}</select></label>
      <div className="form-grid"><label className="field">Arrival<input required type="date" min={todayISO()} value={form.arrival} onInput={e => update('arrival', e.currentTarget.value)} onChange={e => update('arrival', e.target.value)}/></label><label className="field">Departure<input required type="date" min={form.arrival || todayISO()} value={form.departure} onInput={e => update('departure', e.currentTarget.value)} onChange={e => update('departure', e.target.value)}/></label></div>
      <div className="form-grid"><label className="field">Staying guests<input required type="number" min="1" max={apartment?.maxGuests ?? 100} value={form.guests} onChange={e => update('guests', e.target.value)}/></label><label className="field">Stay duration<select value={form.duration} onChange={e => update('duration', e.target.value)}>{['Daily','Weekly','Monthly','Other agreed duration'].map(value => <option key={value}>{value}</option>)}</select></label></div>
      <label className="field">Your name <span>Optional</span><input autoComplete="name" maxLength={100} value={form.name} onChange={e => update('name', e.target.value)}/></label>
      <label className="field">Purpose<select value={form.purpose} onChange={e => update('purpose', e.target.value)}>{['Normal stay','Work / business','Longer stay','Get-together / party'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="field">Anything else? <span>Optional</span><textarea rows={4} maxLength={1000} placeholder="Arrival preferences, event group size, or questions for our team…" value={form.notes} onChange={e => update('notes', e.target.value)}/></label>
      {errors.length > 0 && <div className="alert" role="alert"><p>Please check your enquiry:</p><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
      <button className="button" type="submit" disabled={!apartments.length}>Review my enquiry <span aria-hidden="true">↗</span></button>
      <p className="form-note">No payment is collected here. This is a request, not a confirmed booking.</p>
      {prepared && <section className="feedback" aria-live="polite"><h2>Your enquiry is ready.</h2><p>Review your message below, then open WhatsApp to send it yourself.</p><pre className="enquiry-preview">{prepared.text}</pre><a className="button" href={prepared.href} target="_blank" rel="noopener noreferrer" onClick={openWhatsApp}>Save enquiry &amp; open WhatsApp ↗</a></section>}
    </form><aside className="panel enquiry-aside"><p className="eyebrow">Good to know</p><h2>A few details, thoughtfully confirmed.</h2><p>{apartment?.availabilityNote ?? 'Choose an apartment to see the current enquiry information.'}</p>{apartment && <><h3>{apartment.name}</h3><p>{apartment.policy}</p></>}<p>For events, share the total group size in your notes. “Staying guests” refers to overnight guests.</p><p>Your enquiry is saved for the Boujee Lux team only when you choose to open WhatsApp.</p><Link className="text-link" href="/privacy">Privacy & enquiries ↗</Link><Link className="text-link" href="/contact">Prefer a conversation? Contact us ↗</Link></aside></div>
  </div></main>;
}
