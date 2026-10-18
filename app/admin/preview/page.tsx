import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {adminIdentity} from '@/lib/cms/access';
import {getContent} from '@/lib/cms/store';
import {previewRedirect} from '@/lib/cms/preview';
import {CmsProvider} from '@/components/cms-provider';
import {CmsPreviewFrame} from '@/components/cms-preview-frame';
import {HomeView} from '@/components/home-view';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata:Metadata={title:'Private saved draft | Chida Moore',robots:{index:false,follow:false,nocache:true}};
export default async function WebsitePreview(){const target=previewRedirect(await adminIdentity());if(target)redirect(target);const snapshot=await getContent();return <CmsProvider content={snapshot}><CmsPreviewFrame revision={snapshot.revision}><HomeView snapshot={snapshot}/></CmsPreviewFrame></CmsProvider>;}
