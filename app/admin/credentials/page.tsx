import {redirect} from "next/navigation";import {adminIdentity} from "@/lib/cms/access";import {CmsCredentials} from "@/components/cms-auth";import type {Metadata} from "next";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"Secure CMS credentials | Chida Moore",robots:{index:false,follow:false}};
export default async function Page(){const session=await adminIdentity();if(!session)redirect("/admin/login");if(!session.mustChange)redirect("/admin");return <CmsCredentials username={session.username}/>;}
