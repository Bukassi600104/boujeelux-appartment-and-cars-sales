import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {VehicleView} from '@/components/vehicle-view';
import {getPublicContent} from '@/lib/cms/store';
import {getPublicSiteUrl,pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const {vehicles,settings}=await getPublicContent();const vehicle=vehicles.find(v=>v.slug===slug);return vehicle?pageMetadata(`/vehicles/${slug}`,`${vehicle.name} | Chida Moore Automobiles`,vehicle.description||`View ${vehicle.name} photos, price and sales information.`,vehicle.featuredImage??vehicle.image,getPublicSiteUrl(settings)):{title:'Vehicle not found',robots:{index:false}};}
export default async function VehiclePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,snapshot=await getPublicContent(),vehicle=snapshot.vehicles.find(item=>item.slug===slug);if(!vehicle)notFound();return <VehicleView snapshot={snapshot} vehicle={vehicle}/>;}
