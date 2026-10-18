import type {CmsContent,CmsVehicle} from "./model";

export type DraftMode="draft"|"published";
export type UploadState="queued"|"normalizing"|"uploading"|"uploaded"|"error";
export type MediaQueueItem={id:string;name:string;size:number;type:string;label:string;cover:boolean;status:UploadState;error:string;fit:"fit"|"crop";focalX:number;focalY:number;file?:File;src?:string;preview?:string};

export function createVehicleDraft(now=Date.now()):CmsVehicle{return {slug:`new-vehicle-${now}`,name:"",make:"",year:"",image:"",alt:"",availability:"Available",restockExpected:false,condition:"Tokunbo",price:"Price on enquiry",priceValue:0,showPrice:false,status:"draft",featured:false,description:"",specifications:[],videos:[],gallery:[]};}
export function commitVehicleDraft<T extends Pick<CmsContent,"vehicles"|"settings">>(content:T,draft:CmsVehicle,mode:DraftMode):T{return {...content,vehicles:[...content.vehicles,{...draft,status:mode}]} as T;}

export function mediaQueue(files:ArrayLike<{name:string;size:number;type:string}>):MediaQueueItem[]{return Array.from(files,item=>({id:`${item.name}-${item.size}-${crypto.randomUUID()}`,name:item.name,size:item.size,type:item.type,label:/cabin|interior/i.test(item.name)?"Interior":"Exterior",cover:false,status:"queued",error:"",fit:"fit",focalX:50,focalY:50,...(typeof File!=="undefined"&&item instanceof File?{file:item}:{} )}));}
export function updateMediaItem(items:MediaQueueItem[],id:string,change:Partial<MediaQueueItem>){return items.map(item=>item.id===id?{...item,...change}:item);}
export function setMediaCover(items:MediaQueueItem[],id:string){return items.map(item=>({...item,cover:item.id===id}));}
export function moveMedia(items:MediaQueueItem[],from:number,to:number){const next=[...items];if(from<0||from>=next.length||to<0||to>=next.length)return next;const [item]=next.splice(from,1);next.splice(to,0,item);return next;}

export function parseRecentVehicles(raw:string|null,published:string[],current:string,max=4):string[]{try{const value=JSON.parse(raw??"[]");if(!Array.isArray(value))return [];const allowed=new Set(published);return [...new Set(value.filter((slug):slug is string=>typeof slug==="string"&&slug!==current&&allowed.has(slug)))].slice(0,max);}catch{return [];}}
export function rememberVehicle(raw:string|null,slug:string,max=6):string[]{let value:string[]=[];try{const parsed=JSON.parse(raw??"[]");if(Array.isArray(parsed))value=parsed.filter(item=>typeof item==="string");}catch{}return [slug,...value.filter(item=>item!==slug)].slice(0,max);}
type Store={get(key:string):unknown;set(key:string,value:string):unknown};
const reminderKey="chida-whatsapp-reminder-dismissed";
export function shouldShowWhatsappReminder(store:Store){try{return store.get(reminderKey)!=="1";}catch{return true;}}
export function dismissWhatsappReminder(store:Store){try{store.set(reminderKey,"1");}catch{}}
export function validChatListingSlug(value:string){return value===""||(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)&&value.length<=100);}
export function chatClickContext(href:string,pathname:string,publishedSlugs:string[]){try{const url=new URL(href,"https://local.invalid");if(url.hostname!=="wa.me")return null;const match=pathname.match(/^\/vehicles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);return match&&publishedSlugs.includes(match[1])?match[1]:"";}catch{return null;}}
export function cropFrame(sourceWidth:number,sourceHeight:number,mode:"fit"|"crop",focalX=50,focalY=50){let sx=0,sy=0,sw=sourceWidth,sh=sourceHeight;if(mode==="crop"){const target=4/3;if(sourceWidth/sourceHeight>target){sw=sourceHeight*target;sx=(sourceWidth-sw)*Math.max(0,Math.min(100,focalX))/100;}else if(sourceWidth/sourceHeight<target){sh=sourceWidth/target;sy=(sourceHeight-sh)*Math.max(0,Math.min(100,focalY))/100;}}const scale=Math.min(1,1920/Math.max(sw,sh));return {sx,sy,sw,sh,width:Math.max(1,Math.round(sw*scale)),height:Math.max(1,Math.round(sh*scale))};}
