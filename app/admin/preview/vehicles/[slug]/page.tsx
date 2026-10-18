import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {adminIdentity} from '@/lib/cms/access';
import {getContent} from '@/lib/cms/store';
import {previewRedirect} from '@/lib/cms/preview';
import {CmsProvider} from '@/components/cms-provider';
import {CmsPreviewFrame} from '@/components/cms-preview-frame';
import {VehicleView} from '@/components/vehicle-view';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata:Metadata={title:'Private vehicle draft | Chida Moore',robots:{index:false,follow:false,nocache:true}};
export default async function VehiclePreview({params}:{params:Promise<{slug:string}>}){const target=previewRedirect(await adminIdentity());if(target)redirect(target);const {slug}=await params,snapshot=await getContent(),vehicle=snapshot.vehicles.find(item=>item.slug===slug);if(!vehicle)notFound();return <CmsProvider content={snapshot}><CmsPreviewFrame revision={snapshot.revision}><VehicleView snapshot={snapshot} vehicle={vehicle} preview/></CmsPreviewFrame></CmsProvider>;}
