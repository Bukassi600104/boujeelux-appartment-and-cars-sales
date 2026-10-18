import type {Metadata} from 'next';
import './globals.css';
import {CatalogProvider} from '@/components/catalog';
import {publicCatalog} from '@/lib/cms-server';
import {lodgingBusinessJsonLd,siteUrl} from '@/lib/seo';
export const metadata:Metadata={metadataBase:new URL(siteUrl()),title:{default:'Boujee Lux | Serviced Apartments in Egbeda, Lagos',template:'%s | Boujee Lux'},description:'A considered place to stay in Egbeda, Lagos. Explore studio and three-bedroom apartments for daily, weekly, monthly or other agreed stays.',robots:{index:true,follow:true}};
// Browser extensions can add html/body attributes before hydration. Limit these
// escape hatches to the document containers; app content still reports mismatches.
export default async function RootLayout({children}:{children:React.ReactNode}){const catalog=await publicCatalog();const jsonLd=JSON.stringify(lodgingBusinessJsonLd()).replace(/</g,'\\u003c');return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body suppressHydrationWarning><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd}}/><CatalogProvider initial={catalog}>{children}</CatalogProvider></body></html>;}
