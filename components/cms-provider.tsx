"use client";
import { createContext,useContext } from "react";
import type { CmsContent } from "@/lib/cms/model";
const Context=createContext<CmsContent|null>(null);
export function CmsProvider({content,children}:{content:CmsContent;children:React.ReactNode}){return <Context.Provider value={content}>{children}</Context.Provider>;}
export function useSiteContent(){const content=useContext(Context);if(!content)throw new Error("Site content provider is missing");return {...content,contact:content.settings.contact};}
