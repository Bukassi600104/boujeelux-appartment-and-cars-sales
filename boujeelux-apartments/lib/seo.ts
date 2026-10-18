import type {Metadata} from 'next';

const fallbackSiteUrl='https://boujeelux-apartments-bukassi-gmailcoms-projects.vercel.app';

export function siteUrl(){
  const configured=process.env.NEXT_PUBLIC_SITE_URL||process.env.SITE_URL||fallbackSiteUrl;
  try{
    const url=new URL(configured);
    return url.protocol==='http:'||url.protocol==='https:'?url.origin:fallbackSiteUrl;
  }catch{return fallbackSiteUrl;}
}

export function publicPageMetadata(title:string,description:string,path:string,image?:{url:string;alt:string}):Metadata{
  return {title,description,alternates:{canonical:path},openGraph:{type:'website',siteName:'Boujee Lux',title,description,url:path,...(image?{images:[image]}:{})}};
}

export function lodgingBusinessJsonLd(){return {'@context':'https://schema.org','@type':['Organization','LodgingBusiness'],name:'Boujee Lux',url:siteUrl(),address:{'@type':'PostalAddress',addressLocality:'Egbeda',addressRegion:'Lagos'}};}
