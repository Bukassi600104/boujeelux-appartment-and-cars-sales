import {notFound} from 'next/navigation';
import {ApartmentView} from '@/components/public-pages';
import {publicCatalog} from '@/lib/cms-server';
import {publicPageMetadata} from '@/lib/seo';
async function publishedApartment(slug:string){const catalog=await publicCatalog();return catalog.records.find(record=>record.published?.slug===slug)?.published;}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const apartment=await publishedApartment(slug);if(!apartment)return {title:'Apartment not found',robots:{index:false,follow:false}};const cover=apartment.photos[0];return publicPageMetadata(apartment.name,apartment.description,`/apartments/${apartment.slug}`,cover?{url:cover.src,alt:cover.alt}:undefined);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const apartment=await publishedApartment(slug);if(!apartment)notFound();return <ApartmentView apartment={apartment}/>;}
