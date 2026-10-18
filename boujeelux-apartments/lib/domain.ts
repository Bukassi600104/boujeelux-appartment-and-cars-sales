import {residencePhotos,studioPhotos} from './property-photos';
export type Rate = { amount: string; basis: 'night'|'week'|'month'|'pending'|'quote'; currency: string };
export type Photo = {src:string; alt:string; illustrative:boolean; scope?:'property-wide';label?:string};
export type Apartment = { id:string; slug:string; name:string; subtitle:string; description:string; bedrooms:number; maxGuests:number|null; location:string; address:string; amenities:string[]; photos:Photo[]; rate:Rate; partyRate:string; caution:string; policy:string; availability:'Ask about dates'|'Available on request'|'Unavailable'; availabilityNote:string };
export type RecordEntry={id:string;version:number;draft:Apartment;published:Apartment|null};
export type Catalog={records:RecordEntry[]};
export const address='House 23/25, 11 Road, B Close, Gowon Estate, Egbeda, Lagos';
export const contact={whatsapp:'2349118781995',primary:'0911 878 1995',second:'0911 467 9578',secondWhatsapp:'2349114679578',callOnly:'+234 707 881 2157',email:'Boujeelux24@gmail.com',instagram:'Boujeelux24'};
export const seedApartments:Apartment[]=[
{id:'residence',slug:'three-bedroom-residence',name:'The Three-Bedroom Residence',subtitle:'Room to come together.',description:'A three-bedroom option in Gowon Estate for up to six staying guests. Plan a short visit, settle in for longer, or speak with our team about a get-together. Every enquiry is reviewed personally before arrangements are confirmed.',bedrooms:3,maxGuests:6,location:'Egbeda, Lagos',address,amenities:[],photos:residencePhotos,rate:{amount:'130000',basis:'pending',currency:''},partyRate:'250000',caution:'50000',policy:'Normal stays: maximum 6 guests. Get-togethers / parties: maximum 25 people, subject to team confirmation. A refundable 50k caution fee applies to both. Stays beyond 15 days receive 10% off. The currency, rate basis and full conditions will be confirmed by the team.',availability:'Ask about dates',availabilityNote:'Our team checks requested dates personally. An enquiry does not hold an apartment.'},
{id:'studio',slug:'studio-suite',name:'The Studio Suite',subtitle:'A little space of your own.',description:'A studio option for your time in Egbeda. Tell us your dates and how you would like to stay, and our team will confirm the details, guest capacity and availability with you.',bedrooms:0,maxGuests:null,location:'Egbeda, Lagos',address,amenities:[],photos:studioPhotos,rate:{amount:'75000',basis:'night',currency:''},partyRate:'',caution:'',policy:'Client-listed rate: 75k per night; currency to be confirmed. A 10% longer-stay discount is advertised; the exact qualifying threshold around 10 days will be confirmed by the team. Studio guest capacity and any caution fee remain to be confirmed.',availability:'Ask about dates',availabilityNote:'Contact the team for current availability and guest capacity.'}];
export const initialCatalog:Catalog={records:seedApartments.map(a=>({id:a.id,version:1,draft:structuredClone(a),published:structuredClone(a)}))};
export function validateApartment(a:Apartment):string[]{
const errors:string[]=[];
if(!a.name.trim()||a.name.length>100)errors.push('Enter a name of 1–100 characters.');
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)||a.slug.length>100)errors.push('Use a lowercase, hyphenated URL slug.');
if(!a.description.trim()||a.description.length>3000)errors.push('Enter a description of 1–3000 characters.');
if(!Number.isInteger(a.bedrooms)||a.bedrooms<0||a.bedrooms>20)errors.push('Bedrooms must be between 0 and 20.');
if(a.maxGuests!==null&&(!Number.isInteger(a.maxGuests)||a.maxGuests<1||a.maxGuests>100))errors.push('Guest capacity must be between 1 and 100, or left unconfirmed.');
for(const amount of [a.rate.amount,a.partyRate,a.caution])if(amount&&(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0))errors.push('Rates must be positive amounts, or left empty for a quote.');
if(a.photos.length<1||a.photos.length>12)errors.push('Use between 1 and 12 photos.');
if(a.photos.some(p=>p.scope!==undefined&&p.scope!=='property-wide'))errors.push('Use a supported photograph scope.');
if(a.photos.some(p=>p.label!==undefined&&(typeof p.label!=='string'||!p.label.trim()||p.label.trim().length>100)))errors.push('Photo labels must contain 1–100 characters.');
if(a.photos.some(p=>!p.alt.trim()||!(/^\/(?:images\/[a-z0-9-]+\.(?:webp|png|jpg)|api\/media\/[a-z0-9-]+\.(?:webp|png|jpe?g))$/.test(p.src)||/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.src))))errors.push('Every photo needs descriptive alt text and a supported local image.');
return errors;
}
export function saveDraft(c:Catalog,a:Apartment,version:number):Catalog{
const errors=validateApartment(a);if(errors.length)throw new Error(errors.join(' '));
const r=c.records.find(x=>x.id===a.id);if(!r||r.version!==version)throw new Error('This listing changed in another tab. Reload the latest version before saving.');
if(c.records.some(x=>x.id!==a.id&&(x.draft.slug===a.slug||x.published?.slug===a.slug)))throw new Error('Another apartment already uses this URL.');
if(r.published&&r.published.slug!==a.slug)throw new Error('A published URL cannot be changed.');
return {records:c.records.map(x=>x.id===a.id?{...x,draft:structuredClone(a),version:x.version+1}:x)};
}
export function publishDraft(c:Catalog,id:string,version:number):Catalog{
const r=c.records.find(x=>x.id===id);if(!r||r.version!==version)throw new Error('This listing changed. Save or reload before publishing.');
const errors=validateApartment(r.draft);if(errors.length)throw new Error(errors.join(' '));
return {records:c.records.map(x=>x.id===id?{...x,published:structuredClone(x.draft),version:x.version+1}:x)};
}
export function rateLabel(rate:Rate):string{if(!rate.amount||rate.basis==='quote')return 'Rate on request';const amount=Number(rate.amount).toLocaleString('en-NG');return (rate.currency?rate.currency+' ':'')+amount+(rate.basis==='pending'?' · basis to confirm':' / '+rate.basis);}
export type Enquiry={name:string;apartment:string;arrival:string;departure:string;guests:string;duration:string;purpose:string;notes:string};
export function todayISO(now=new Date()){return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}
export function validateEnquiry(e:Enquiry,maxGuests:number|null,today=todayISO()):string[]{
const errors:string[]=[];const validDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
if(!e.apartment)errors.push('Choose an apartment.');
if(!validDate(e.arrival)||!validDate(e.departure))errors.push('Enter valid arrival and departure dates.');
else {if(e.arrival<today)errors.push('Arrival cannot be in the past.');if(e.departure<=e.arrival)errors.push('Departure must be after arrival.');}
const n=Number(e.guests);if(!Number.isInteger(n)||n<1||n>100)errors.push('Enter a guest count between 1 and 100.');
else if(maxGuests&&n>maxGuests)errors.push('This enquiry exceeds the stated capacity of '+maxGuests+'.');
if(!['Daily','Weekly','Monthly','Other agreed duration'].includes(e.duration))errors.push('Choose a stay duration.');
if(e.name.length>100||e.notes.length>1000)errors.push('Please shorten your name or message.');
return errors;
}
export function enquiryText(e:Enquiry){return ['Hello Boujee Lux, I would like to enquire about '+e.apartment+'.',e.name?'Name: '+e.name:'', 'Arrival: '+e.arrival,'Departure: '+e.departure,'Guests: '+e.guests,'Stay: '+e.duration,'Purpose: '+e.purpose,e.notes?'Notes: '+e.notes:'','Please confirm availability, the currency and applicable rates, any caution fee, and stay conditions. I understand this is an enquiry, not a confirmed reservation.'].filter(Boolean).join('\n');}
export function whatsappLink(recipient:string|undefined,message:string){return recipient&&/^[1-9]\d{7,14}$/.test(recipient)?'https://wa.me/'+recipient+'?text='+encodeURIComponent(message):null;}
export function isLocalDemo(environment:string|undefined,enabled:string|undefined,host:string){return environment==='development'&&enabled==='true'&&/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);}

function objectValue(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value);}
function storedApartment(value:unknown):value is Apartment{
  if(!objectValue(value))return false;
  const strings=['id','slug','name','subtitle','description','location','address','partyRate','caution','policy','availability','availabilityNote'];
  if(!strings.every(key=>typeof value[key]==='string')||!value.id)return false;
  if(typeof value.bedrooms!=='number'||!(value.maxGuests===null||typeof value.maxGuests==='number'))return false;
  if(!Array.isArray(value.amenities)||!value.amenities.every(a=>typeof a==='string'))return false;
  if(!Array.isArray(value.photos)||!value.photos.every(p=>objectValue(p)&&typeof p.src==='string'&&typeof p.alt==='string'&&typeof p.illustrative==='boolean'&&(p.label===undefined||typeof p.label==='string')))return false;
  if(!objectValue(value.rate)||typeof value.rate.amount!=='string'||typeof value.rate.currency!=='string'||!['night','week','month','pending','quote'].includes(String(value.rate.basis)))return false;
  if(!['Ask about dates','Available on request','Unavailable'].includes(String(value.availability)))return false;
  return validateApartment(value as unknown as Apartment).length===0;
}
export function parseStoredCatalog(value:unknown):Catalog|null{
  if(!objectValue(value)||!Array.isArray(value.records))return null;
  const ids=new Set<string>();const slugs=new Map<string,string>();
  for(const record of value.records){
    if(!objectValue(record)||typeof record.id!=='string'||!record.id||!Number.isSafeInteger(record.version)||Number(record.version)<1||!storedApartment(record.draft)||record.draft.id!==record.id)return null;
    if(record.published!==null&&(!storedApartment(record.published)||record.published.id!==record.id))return null;
    if(ids.has(record.id))return null;ids.add(record.id);
    for(const apartment of [record.draft,record.published]){if(!apartment)continue;const owner=slugs.get(apartment.slug);if(owner&&owner!==record.id)return null;slugs.set(apartment.slug,record.id);}
  }
  const catalog=structuredClone(value) as Catalog;
  const stock=new Set(['/images/living.webp','/images/bedroom.webp','/images/detail.webp']);
  for(const record of catalog.records){
    const replacement=record.id==='residence'?residencePhotos:record.id==='studio'?studioPhotos:null;
    if(!replacement)continue;
    for(const apartment of [record.draft,record.published]){
      if(apartment&&apartment.photos.every(photo=>photo.illustrative&&stock.has(photo.src)))apartment.photos=structuredClone(replacement);
    }
  }
  return catalog;
}
export function catalogStorageText(catalog:Catalog):string{
  const text=JSON.stringify(catalog);
  // Conservatively budget UTF-16 storage; the browser's remaining quota may be lower.
  if(text.length*2>4*1024*1024)throw new Error('Local demo storage limit reached (4MB estimated total). Use fewer or smaller images; your previous saved content is unchanged.');
  return text;
}
