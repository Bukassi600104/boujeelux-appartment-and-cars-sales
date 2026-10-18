/* eslint-disable @next/next/no-html-link-for-pages */
import { adminIdentity } from "@/lib/cms/access";
import { getContent } from "@/lib/cms/store";
import { CmsDashboard } from "@/components/cms-dashboard";
import {redirect} from "next/navigation";
import type { Metadata } from "next";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Content management | Chida Moore",robots:{index:false,follow:false}};
export default async function Admin(){const user=await adminIdentity();if(!user)redirect("/admin/login");if(user.mustChange)redirect("/admin/credentials");return <main id="main-content" className="cms-shell"><CmsDashboard username={user.username} role={user.role} permissions={user.permissions} initial={await getContent()}/></main>;}
