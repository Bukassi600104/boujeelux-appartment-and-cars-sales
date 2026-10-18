import {Suspense} from 'react';import {Browse} from '@/components/public-pages';
import {publicPageMetadata} from '@/lib/seo';
export const metadata=publicPageMetadata('Our apartments','Browse the apartment options currently published by Boujee Lux in Egbeda, Lagos.','/apartments');
export default function Page(){return <Suspense fallback={<main id="main-content" className="section"><h1>Our apartments</h1></main>}><Browse/></Suspense>;}
