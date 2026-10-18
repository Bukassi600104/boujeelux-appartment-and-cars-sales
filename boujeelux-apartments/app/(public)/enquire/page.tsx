import {Suspense} from 'react';import {Enquire} from '@/components/enquire';
import {publicPageMetadata} from '@/lib/seo';
export const metadata=publicPageMetadata('Plan your stay','Send Boujee Lux your preferred apartment, dates and guest details for personal confirmation.','/enquire');
export default function Page(){return <Suspense fallback={<main id="main-content" className="section"><h1>Plan your stay</h1></main>}><Enquire/></Suspense>;}
