'use client';
import {normalizeImage,type CropOptions,type NormalizedImage} from './image-normalizer';
import type {Photo} from './domain';
type Payload={base64:string;type:'image/webp';name:string};
type Dependencies={normalize:(file:File,crop:CropOptions)=>Promise<NormalizedImage>;send:(payload:Payload)=>Promise<{src:string}>};
async function send(payload:Payload){const response=await fetch('/api/cms/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Upload failed.');return result as {src:string};}
export async function runNormalizedUpload(file:File,apartmentName:string,crop:CropOptions={aspect:4/3,focalX:.5,focalY:.5,zoom:1},dependencies:Dependencies={normalize:normalizeImage,send}){const normalized=await dependencies.normalize(file,crop);const result=await dependencies.send({base64:normalized.base64,type:normalized.type,name:file.name.replace(/\.[^.]+$/,'.webp')});return{photo:{src:result.src,alt:`${apartmentName} · property view`,illustrative:false,label:'Property view'} as Photo,warning:normalized.warning,width:normalized.width,height:normalized.height};}
