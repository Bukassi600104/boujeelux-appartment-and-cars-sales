import type {MetadataRoute} from 'next';
import {publicCatalog} from '@/lib/cms-server';
import {siteUrl} from '@/lib/seo';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=siteUrl();
  const catalog=await publicCatalog();
  const publicPaths=['','/apartments','/enquire','/contact','/our-approach','/privacy'];
  const apartmentPaths=catalog.records.flatMap(record=>record.published?[`/apartments/${record.published.slug}`]:[]);
  return [...publicPaths,...apartmentPaths].map(path=>({url:`${base}${path}`,changeFrequency:path.startsWith('/apartments/')?'weekly':'monthly'}));
}
