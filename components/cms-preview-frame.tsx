'use client';
import {useState,type ReactNode} from 'react';
import {previewLinkTarget} from '@/lib/cms/preview';
export function CmsPreviewFrame({revision,children}:{revision:number;children:ReactNode}){
 const[note,setNote]=useState('Contact forms are disabled in this preview.');
 return <div data-cms-preview="saved" onSubmitCapture={event=>{event.preventDefault();event.stopPropagation();setNote('This is a private preview. No customer enquiry was submitted.');}} onClickCapture={event=>{const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;if(!anchor)return;const original=anchor.getAttribute('href')??'',target=previewLinkTarget(original);if(target===null){event.preventDefault();event.stopPropagation();setNote('Contact actions are disabled here to keep preview activity out of customer records.');}else if(target!==original){event.preventDefault();event.stopPropagation();location.href=target;}}}>
  {children}
  <aside role="status" aria-label="Saved draft preview" style={{position:'fixed',zIndex:100,bottom:16,left:'50%',transform:'translateX(-50%)',width:'min(92vw,760px)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'14px 18px',borderRadius:12,background:'#14222b',color:'#fff',boxShadow:'0 8px 32px #0004',fontSize:12,flexWrap:'wrap'}}><div><strong style={{display:'block',fontSize:14}}>Private saved-draft preview · Revision {revision}</strong><span style={{opacity:.8}}>{note} Unsaved form changes are not shown.</span></div><a href="/admin" style={{color:'#f4d57c',fontWeight:700,whiteSpace:'nowrap'}}>Back to CMS →</a></aside>
 </div>;
}
