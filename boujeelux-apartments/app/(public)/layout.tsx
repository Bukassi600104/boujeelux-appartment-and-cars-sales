import {SiteHeader,SiteFooter} from '@/components/site';
export default function PublicLayout({children}:{children:React.ReactNode}){return <><a className="skip" href="#main-content">Skip to content</a><SiteHeader/>{children}<SiteFooter/></>;}
