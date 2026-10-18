import {CmsError,publicProjection} from './validation.mjs';
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));return value;}
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const projected=draft=>publicProjection('chida',draft??{settings:{},vehicles:[]});
export function buildCarPublication(draft,published,scope,vehicleSlug){
 if(!draft||!['website','vehicle','all'].includes(scope))throw new CmsError('Choose a valid publication scope.');
 const next=projected(draft),live=structuredClone(published??{settings:{},vehicles:[]});let result;
 if(scope==='all')result=next;
 else if(scope==='website')result={settings:next.settings,vehicles:live.vehicles};
 else{
  if(typeof vehicleSlug!=='string'||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(vehicleSlug)||!draft.vehicles.some(v=>v.slug===vehicleSlug)&&!live.vehicles.some(v=>v.slug===vehicleSlug))throw new CmsError('Choose a saved vehicle to publish.');
  const selected=next.vehicles.find(v=>v.slug===vehicleSlug);const vehicles=live.vehicles.filter(v=>v.slug!==vehicleSlug);
  if(selected){const index=live.vehicles.findIndex(v=>v.slug===vehicleSlug);vehicles.splice(index<0?vehicles.length:index,0,selected);}
  result={settings:live.settings,vehicles};
 }
 return structuredClone(result);
}
export function publicationSummary(draft,published,publishedAt=null){
 const next=projected(draft),live=published??{settings:{},vehicles:[]};
 const websiteHasDraftChanges=!same(next.settings,live.settings),slugs=new Set([...next.vehicles.map(v=>v.slug),...live.vehicles.map(v=>v.slug)]);
 const vehicleDraftSlugs=[...slugs].filter(slug=>!same(next.vehicles.find(v=>v.slug===slug)??null,live.vehicles.find(v=>v.slug===slug)??null));
 return {hasDraftChanges:websiteHasDraftChanges||vehicleDraftSlugs.length>0,websiteHasDraftChanges,vehicleDraftSlugs,publishedVehicleSlugs:live.vehicles.map(v=>v.slug),publishedAt};
}
