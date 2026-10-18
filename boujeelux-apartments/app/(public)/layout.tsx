import {SiteHeader,SiteFooter} from '@/components/site';
import {RecentFromPath,WhatsAppAssist} from '@/components/public-refinements';
export default function PublicLayout({children}:{children:React.ReactNode}){return <><a className="skip" href="#main-content">Skip to content</a><SiteHeader/>{children}<RecentFromPath/><WhatsAppAssist/><SiteFooter/></>;}
