import { z } from "zod";
import type { Vehicle } from "../vehicles";

export const mediaUrl = z.string().max(500).refine(value => /^\/(?!\/)[a-zA-Z0-9/_ .%-]+\.(webp|png|jpe?g|gif|avif|mp4|webm)(\?[a-zA-Z0-9=&%_-]+)?$/i.test(value), "Use a local image/video URL from the media library");
export const imageUrl = mediaUrl.refine(value => /\.(webp|png|jpe?g|gif|avif)(\?|$)/i.test(value), "Choose an image, not a video");
export const videoUrl = mediaUrl.refine(value => /\.(mp4|webm)(\?|$)/i.test(value), "Choose an MP4 or WebM video");
const optionalImage = z.preprocess(value => value === "" ? undefined : value, imageUrl.optional());
const image = z.object({ src: imageUrl, alt: z.string().min(1).max(250), label: z.string().min(1).max(100) }).strict();
export const vehicleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100), name: z.string().trim().min(3).max(140), make: z.string().trim().min(1).max(50), year: z.string().regex(/^(19|20)\d{2}$/),
  image: imageUrl, cutout: optionalImage, featuredImage: optionalImage, alt: z.string().min(1).max(250),
  availability: z.enum(["Available", "Reserved", "Sold", "Unavailable"]), restockExpected:z.boolean().default(false), condition: z.enum(["Tokunbo", "Nigerian used", "New"]), priceValue: z.number().finite().min(0).max(10000000000), price: z.string().max(60), showPrice: z.boolean().default(true),
  status: z.enum(["published", "draft", "archived"]).default("published"), featured: z.boolean().default(true),
  description: z.string().max(4000).default(""), specifications: z.array(z.object({label:z.string().trim().min(1).max(80),value:z.string().trim().min(1).max(300)}).strict()).max(30).default([]),
  videos: z.array(videoUrl).max(5).default([]), gallery: z.array(image).min(1).max(40),
}).superRefine((vehicle,ctx)=>{if(vehicle.restockExpected&&!(["Sold","Unavailable"] as string[]).includes(vehicle.availability))ctx.addIssue({code:"custom",path:["restockExpected"],message:"Available soon can only be confirmed for sold or unavailable vehicles"});});
export type CmsVehicle = z.infer<typeof vehicleSchema>;
const phone = z.object({ display:z.string().min(5).max(40),href:z.string().regex(/^tel:\+?\d{7,15}$/) });
const whatsapp = z.object({ display:z.string().min(5).max(40),href:z.string().regex(/^https:\/\/wa\.me\/\d{7,15}$/) });
export const settingsSchema = z.object({
  heroTitle:z.string().trim().min(3).max(150),heroSubtitle:z.string().trim().min(3).max(500),heroImage:imageUrl,heroVehicleSlug:z.string().max(100),
  aboutTitle:z.string().trim().min(3).max(150),aboutText:z.string().trim().min(3).max(5000),
  seoTitle:z.string().trim().min(3).max(100),seoDescription:z.string().trim().min(10).max(300),
  siteUrl:z.string().url().refine(v=>/^https:\/\//.test(v)),inspectionEnabled:z.boolean(),sourcingEnabled:z.boolean(),
  contact:z.object({whatsapp:z.array(whatsapp).min(2).max(4),phones:z.array(phone).min(3).max(5),emails:z.array(z.string().email()).min(2).max(5),instagram:z.string().url().refine(v=>/^https:\/\/(www\.)?instagram\.com\//.test(v))}),
});
export type CmsSettings = z.infer<typeof settingsSchema>;
export type CmsContent = { vehicles:CmsVehicle[]; settings:CmsSettings };
const contentSchema = z.object({vehicles:z.array(vehicleSchema).max(300),settings:settingsSchema}).superRefine((data,ctx)=>{
  if(new Set(data.vehicles.map(v=>v.slug)).size !== data.vehicles.length) ctx.addIssue({code:"custom",message:"Vehicle slugs must be unique"});

});
export function validateContent(value:unknown):CmsContent { const data=contentSchema.parse(value); return {...data,vehicles:data.vehicles.map(v=>({...v,price:v.showPrice ? new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(v.priceValue):"Price on enquiry"}))}; }
export function publicVehicles<T extends {status?:string}>(items:T[]):T[] { return items.filter(v=>!v.status||v.status==="published"); }
export function isAdmin(user:{email:string;userId:string}|null,allowlist:string,local:boolean):boolean { return !!user && ((local&&user.userId==="local_seedy"&&user.email==="seedy@sites.test") || allowlist.split(",").map(v=>v.trim().toLowerCase()).filter(Boolean).includes(user.email.toLowerCase())); }
export function isLocalTestHost(host:string,development:boolean):boolean { return development && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host); }
export function sameOrigin(origin:string|null,url:string):boolean { try{return !!origin&&new URL(origin).origin===new URL(url).origin;}catch{return false;} }
export function validateCredentials(username:string,password:string):string[]{const errors:string[]=[];if(!/^[A-Za-z][A-Za-z0-9._-]{3,39}$/.test(username))errors.push("Username must start with a letter and be 4–40 characters using letters, numbers, dots, underscores or hyphens.");const bytes=new TextEncoder().encode(password).length;if(password.length<15||bytes>72)errors.push("Password must be at least 15 characters and no more than 72 UTF-8 bytes.");return errors;}
export function publicSnapshot<T extends {vehicles:Array<{status?:string}>;settings:unknown}>(snapshot:{content:T|null;revision:number;updatedAt:string|null},seed:T):T&{revision:number;updatedAt:string|null}{const content=snapshot.content??{...seed,vehicles:[]};return {...content,vehicles:publicVehicles(content.vehicles),revision:snapshot.revision,updatedAt:snapshot.updatedAt} as T&{revision:number;updatedAt:string|null};}
export function cmsVehicle(vehicle:Vehicle):CmsVehicle {return vehicleSchema.parse(vehicle);}
