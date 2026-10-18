"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imageVariant,imageSources } from "@/lib/image-presentation";
export function SafeImage({src,size=960,sizes,alt="",...props}:React.ImgHTMLAttributes<HTMLImageElement>&{src:string;size?:480|960|"thumb"}){const[fallback,setFallback]=useState(0);const uploaded=src.startsWith("/api/media/");const source=fallback===2?"/image-unavailable.svg":fallback===1||uploaded?src:imageVariant(src,size);return <img {...props} alt={alt} src={source} sizes={sizes} srcSet={fallback||uploaded||size==="thumb"?undefined:imageSources(src)} onError={()=>setFallback(n=>Math.min(2,n+1))}/>;}
