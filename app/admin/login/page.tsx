import {redirect} from "next/navigation";import {adminIdentity} from "@/lib/cms/access";import {CmsLogin} from "@/components/cms-auth";import type {Metadata} from "next";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"CMS sign in | Chida Moore",robots:{index:false,follow:false}};
export default async function Page(){const session=await adminIdentity();if(session)redirect(session.mustChange?"/admin/credentials":"/admin");return <CmsLogin/>;}
