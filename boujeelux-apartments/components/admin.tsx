'use client';

import Link from 'next/link';
import {useCallback,useEffect,useState, type FormEvent} from 'react';
import {useCatalog} from './catalog';
import {ApartmentView} from './public-pages';
import {type Apartment, type RecordEntry} from '@/lib/domain';
import {ApartmentWizard} from './apartment-wizard';
import {runNormalizedUpload} from '@/lib/upload-workflow';

type View='overview'|'apartments'|'editor'|'activity';
export function Admin(){const manager=useCatalog();const[view,setView]=useState<View>('overview');const[selectedId,setSelectedId]=useState('');const[notice,setNotice]=useState('');const[dirty,setDirty]=useState(false);const[wizard,setWizard]=useState(false);const record=manager.catalog.records.find(r=>r.id===selectedId);
  function navigate(next:View){if(dirty){setNotice('Save or reload your current edits before leaving this apartment.');return;}setView(next);setWizard(false);setNotice('');}
  function manage(id:string){if(dirty){setNotice('Save or reload your current edits before switching apartments.');return;}setSelectedId(id);setView('editor');setNotice('');}
  const listingRows=<div className="listing-table">{manager.catalog.records.map(r=><article key={r.id}><img src={r.draft.photos[0]?.src||'/images/boujeelux-05-studio-bedroom.webp'} alt=""/><div><strong>{r.draft.name}</strong><small>{r.published?'Published':'Draft only'} · {r.draft.availability}</small></div><button type="button" onClick={()=>manage(r.id)}>Manage apartment</button></article>)}</div>;
  return <main id="main-content" className="admin-shell"><aside className="admin-nav"><img src="/brand/boujeelux-nav-transparent.png" alt="Boujee Lux"/><nav aria-label="Content manager"><button type="button" aria-current={view==='overview'?'page':undefined} onClick={()=>navigate('overview')}>Overview</button><button type="button" aria-current={view==='apartments'||view==='editor'?'page':undefined} onClick={()=>navigate('apartments')}>Apartments</button><button type="button" aria-current={view==='activity'?'page':undefined} onClick={()=>navigate('activity')}>Enquiries &amp; activity</button></nav><button type="button" onClick={()=>void manager.logout()}>Sign out</button></aside><div className="admin-workspace container"><header className="page-intro"><p className="eyebrow">Boujee Lux · secure manager</p><h1>{view==='overview'?'Dashboard':view==='activity'?'Enquiries & activity':view==='editor'?'Manage apartment':'Apartments'}</h1><p>{view==='overview'?'Your residences, thoughtfully managed.':'Keep published information and guest enquiries organised.'}</p><Link className="button-outline" href="/">View website ↗</Link>{view!=='activity'&&<button className="button" type="button" onClick={()=>{if(dirty)setNotice('Save or reload your current edits first.');else setWizard(true);}}>Add apartment</button>}</header>{notice&&<p className="feedback" role="status">{notice}</p>}{wizard&&<ApartmentWizard onCancel={()=>setWizard(false)} onSave={async apartment=>{await manager.createDraft(apartment);setWizard(false);setSelectedId(apartment.id);setView('editor');setNotice('Private draft created. Review it before publishing.');}}/>}
    {view==='overview'&&<><section className="dashboard-stats" aria-label="Catalogue overview"><div><span>Apartments</span><strong>{manager.catalog.records.length}</strong></div><div><span>Published</span><strong>{manager.catalog.records.filter(r=>r.published).length}</strong></div><div><span>Draft only</span><strong>{manager.catalog.records.filter(r=>!r.published).length}</strong></div></section><section className="panel dashboard-list"><div className="section-heading"><div><p className="eyebrow">Your apartments</p><h2>Current catalogue</h2></div><button type="button" onClick={()=>setView('apartments')}>View all apartments</button></div>{listingRows}</section></>}
    {view==='apartments'&&<section className="panel dashboard-list"><h2>Apartment listings</h2>{listingRows}</section>}
    {view==='editor'&&record&&<><button type="button" className="back-link" onClick={()=>navigate('apartments')}>← Back to apartments</button><ApartmentEditor key={record.id} record={record} onNotice={setNotice} onDirty={setDirty}/></>}
    {view==='activity'&&<AdminOperations onNotice={setNotice}/>}</div></main>;}

type EnquiryRow={id:string;created_at?:string;status?:string;payload?:Record<string,unknown>};
function AdminOperations({onNotice}:{onNotice:(message:string)=>void}){const[enquiries,setEnquiries]=useState<EnquiryRow[]>([]),[auditCount,setAuditCount]=useState(0),[mediaCount,setMediaCount]=useState(0),[clicks,setClicks]=useState(0);
 async function request(action:string,data:Record<string,unknown>={}){const response=await fetch(`/api/cms/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not load CMS activity.');return result;}
 const load=useCallback(async()=>{try{const[e,a,m,metrics]=await Promise.all([request('enquiries'),request('audit'),request('mediaList'),fetch('/api/admin/metrics').then(r=>r.ok?r.json():{total:0})]);setEnquiries(Array.isArray(e)?e:e.enquiries??[]);setAuditCount((Array.isArray(a)?a:a.audit??[]).length);setMediaCount((Array.isArray(m)?m:m.media??[]).length);setClicks(Number(metrics.total)||0);}catch(error){onNotice(error instanceof Error?error.message:'Could not load CMS activity.');}},[onNotice]);
 useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(timer);},[load]);
 async function updateStatus(id:string,status:string){try{await request('status',{id,status});await load();onNotice('Enquiry status updated.');}catch(error){onNotice(error instanceof Error?error.message:'Could not update enquiry.');}}
 return <section className="panel admin-editor"><header><p className="eyebrow">Team activity</p><h2>Enquiries &amp; records</h2><p>{enquiries.length} enquiries · {mediaCount} media items · {auditCount} audit events · {clicks} recorded website clicks</p></header>{enquiries.length===0?<p>No enquiries have arrived yet.</p>:<div className="photo-grid">{enquiries.slice(0,20).map(item=><article className="panel" key={item.id}><strong>{String(item.payload?.apartment??'Apartment enquiry')}</strong><p>{item.created_at?new Date(item.created_at).toLocaleString():'Date unavailable'} · {item.status??'New'}</p><div className="form-actions">{['New','Contacted','Pending confirmation','Confirmed','Closed'].map(status=><button type="button" key={status} disabled={item.status===status} onClick={()=>void updateStatus(item.id,status)}>{status}</button>)}</div></article>)}</div>}</section>;}

function ApartmentEditor({record, onNotice, onDirty}:{record:RecordEntry; onNotice:(message:string)=>void; onDirty:(value:boolean)=>void}) {
  const manager = useCatalog();
  const [apartment, setApartment] = useState(() => structuredClone(record.draft));
  const [version, setVersion] = useState(record.version);
  const dirty = JSON.stringify(apartment) !== JSON.stringify(record.draft);
  const changedElsewhere = record.version !== version;
  function update(change:Partial<Apartment>) {const next={...apartment,...change};setApartment(next);onDirty(JSON.stringify(next)!==JSON.stringify(record.draft));}
  function reload() {setApartment(structuredClone(record.draft)); setVersion(record.version); onDirty(false); onNotice('Loaded the saved draft.');}
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {setVersion(await manager.save(apartment, version)); onDirty(false); onNotice('Draft saved securely. Publish it when you are ready to update the website.');} catch (error) {onNotice(error instanceof Error ? error.message : 'Could not save.');}
  }
  async function publish() {
    if (dirty) {onNotice('Save your draft before publishing or unpublishing.'); return;}
    try {setVersion(await manager.publish(record.id, version)); onNotice('Published to the website.');} catch (error) {onNotice(error instanceof Error ? error.message : 'Could not publish.');}
  }
  async function unpublish() {
    if (dirty) {onNotice('Save your draft before unpublishing.'); return;}
    try {setVersion(await manager.unpublish(record.id, version)); onNotice('Unpublished. The secure draft and photos are preserved.');} catch (error) {onNotice(error instanceof Error ? error.message : 'Could not unpublish.');}
  }
  async function upload(file:File) {
    try {
      const result=await runNormalizedUpload(file,apartment.name);
      update({photos:[...apartment.photos,result.photo]});
      onNotice(result.warning||'Image normalized, uploaded and added to the draft. Review its label and alt text, then save.');
    } catch (error) {onNotice(error instanceof Error ? error.message : 'Could not add image.');}
  }
  return <form className="admin-editor panel" onSubmit={save}>
    <header><p className="eyebrow">Draft editor · v{version}</p><h2>{record.draft.name}</h2><Link className="text-link" href={`/admin/preview/${record.id}`} target="_blank" rel="noopener noreferrer">Preview saved draft ↗</Link></header>
    {changedElsewhere && <p className="alert" role="alert">This record changed in another tab. Your unsaved edits are still shown; load the latest draft before continuing.</p>}
    <div className="form-grid"><label className="field">Apartment name<input required maxLength={100} value={apartment.name} onChange={e => update({name:e.target.value})}/></label><label className="field">URL slug<input required value={apartment.slug} disabled={!!record.published} onChange={e => update({slug:e.target.value})}/></label></div>
    <label className="field">Subtitle<input value={apartment.subtitle} onChange={e => update({subtitle:e.target.value})}/></label>
    <label className="field">Description<textarea required rows={4} maxLength={3000} value={apartment.description} onChange={e => update({description:e.target.value})}/></label>
    <div className="form-grid"><label className="field">Bedrooms<input required type="number" min="0" max="20" value={apartment.bedrooms} onChange={e => update({bedrooms:Number(e.target.value)})}/></label><label className="field">Maximum staying guests (blank if unconfirmed)<input type="number" min="1" max="100" value={apartment.maxGuests ?? ''} onChange={e => update({maxGuests:e.target.value ? Number(e.target.value) : null})}/></label></div>
    <div className="form-grid"><label className="field">Location<input value={apartment.location} onChange={e => update({location:e.target.value})}/></label><label className="field">Address<input value={apartment.address} onChange={e => update({address:e.target.value})}/></label></div>
    <div className="form-grid"><label className="field">Rate amount<input type="number" min="0" step="0.01" value={apartment.rate.amount} onChange={e => update({rate:{...apartment.rate, amount:e.target.value}})}/></label><label className="field">Rate basis<select value={apartment.rate.basis} onChange={e => update({rate:{...apartment.rate, basis:e.target.value as Apartment['rate']['basis']}})}>{['night','week','month','pending','quote'].map(value => <option key={value}>{value}</option>)}</select></label><label className="field">Currency (blank if unconfirmed)<input maxLength={20} value={apartment.rate.currency} onChange={e => update({rate:{...apartment.rate, currency:e.target.value}})}/></label><label className="field">Party rate<input type="number" min="0" step="0.01" value={apartment.partyRate} onChange={e => update({partyRate:e.target.value})}/></label><label className="field">Caution fee<input type="number" min="0" step="0.01" value={apartment.caution} onChange={e => update({caution:e.target.value})}/></label><label className="field">Availability<select value={apartment.availability} onChange={e => update({availability:e.target.value as Apartment['availability']})}>{['Ask about dates','Available on request','Unavailable'].map(value => <option key={value}>{value}</option>)}</select></label></div>
    <label className="field">Availability note<textarea rows={2} value={apartment.availabilityNote} onChange={e => update({availabilityNote:e.target.value})}/></label>
    <label className="field">Stay policy<textarea rows={4} value={apartment.policy} onChange={e => update({policy:e.target.value})}/></label>
    <label className="field">Confirmed amenities (one per line)<textarea rows={3} value={apartment.amenities.join('\n')} onChange={e => update({amenities:e.target.value.split('\n').map(s => s.trim()).filter(Boolean)})}/></label>
    <fieldset><legend>Apartment photographs</legend><p>Illustrative images must stay labelled. Only uncheck “Illustrative” for an actual photograph of this property. Up to 12 photos per listing. JPEG, PNG and WebP sources under 12MB are optimized before upload; originals are unchanged.</p><div className="photo-grid">{apartment.photos.map((photo,index) => <div key={index}><img src={photo.src} alt={photo.alt} width="360" height="240" loading="lazy"/><label className="field">Alt text<input required value={photo.alt} onChange={e => update({photos:apartment.photos.map((p,i) => i === index ? {...p, alt:e.target.value} : p)})}/></label><label className="field">Photo label<input maxLength={100} value={photo.label??''} onChange={e=>update({photos:apartment.photos.map((p,i)=>i===index?{...p,label:e.target.value||undefined}:p)})}/></label><label><input type="checkbox" checked={photo.illustrative} onChange={e => update({photos:apartment.photos.map((p,i) => i === index ? {...p, illustrative:e.target.checked} : p)})}/> Illustrative</label><div className="form-actions"><button type="button" disabled={index === 0} onClick={() => {const photos=[...apartment.photos]; [photos[index-1],photos[index]]=[photos[index],photos[index-1]]; update({photos});}}>Move earlier</button><button type="button" disabled={apartment.photos.length === 1} onClick={() => update({photos:apartment.photos.filter((_,i) => i !== index)})}>Remove from draft</button></div></div>)}</div><label className="field">Upload an optimized photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={apartment.photos.length >= 12} onChange={e => {const file=e.target.files?.[0]; if(file) void upload(file); e.target.value='';}}/></label></fieldset>
    <div className="form-actions"><button className="button" type="submit">Save draft</button><button className="button-outline" type="button" onClick={publish} disabled={changedElsewhere}>Publish to website</button><button type="button" onClick={unpublish} disabled={!record.published || changedElsewhere}>Unpublish from website</button><button type="button" onClick={reload}>Reload saved draft</button></div>
    <p className="form-note">{dirty ? 'Unsaved draft changes.' : 'Saved draft loaded.'} Publishing changes the public website. Saving a draft keeps the current published listing unchanged.</p>
  </form>;
}

export function DraftPreview({id}:{id:string}) {
  const {catalog} = useCatalog();
  const record = catalog.records.find(r => r.id === id);
  return <><div className="container panel"><p className="eyebrow">Private draft preview</p><p>This is the saved draft, not necessarily the published listing.</p><Link className="button-outline" href="/admin">Back to manager</Link></div>{record ? <ApartmentView key={id} apartment={record.draft} isDraft/> : <main id="main-content" className="section empty"><h1>Draft not found</h1><p>Return to the manager to choose an apartment.</p></main>}</>;
}
