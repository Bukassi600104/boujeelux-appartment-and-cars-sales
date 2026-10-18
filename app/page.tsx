import {HomeView} from '@/components/home-view';
import {getPublicContent} from '@/lib/cms/store';
import {pageMetadata,getPublicSiteUrl} from '@/lib/seo';
export async function generateMetadata(){const {settings}=await getPublicContent();return pageMetadata('/',settings.seoTitle,settings.seoDescription,settings.heroImage,getPublicSiteUrl(settings));}
export default async function Home(){return <HomeView snapshot={await getPublicContent()}/>;}
