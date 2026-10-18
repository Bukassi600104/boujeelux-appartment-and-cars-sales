"use client";
import {useEffect,useRef,useState,type KeyboardEvent} from "react";
import {X} from "lucide-react";
import type {CmsVehicle} from "@/lib/cms/model";
import {createVehicleDraft} from "@/lib/cms/refinements";
import {editVehiclePhoto} from "@/lib/cms/vehicle-editor";
import {VehicleEditingFlow} from "./cms-vehicle-editing-flow";
export function NewVehicleWizard({photos,onClose,onCommit,onRefresh,canPublish,allowUpload}:{photos:CmsVehicle["gallery"];onClose:()=>void;onCommit:(vehicle:CmsVehicle,publish:boolean)=>Promise<void>;onRefresh:()=>void;canPublish:boolean;allowUpload:boolean}){
  const[draft,setDraft]=useState<CmsVehicle>(()=>({...createVehicleDraft(),status:"published"}));const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();return()=>previous?.focus();},[]);
  const keepFocus=(event:KeyboardEvent<HTMLElement>)=>{if(event.key==="Escape"&&!busy){event.preventDefault();onClose();return;}if(event.key!=="Tab")return;const controls=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],summary')??[]).filter(item=>!item.matches(":disabled")&&item.getClientRects().length>0);const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};
  const commit=async()=>{setBusy(true);setError("");try{await onCommit(draft,false);}catch(issue){setError(issue instanceof Error?issue.message:"Could not save this vehicle. Your inputs have been kept; please try again.");}finally{setBusy(false);}};
  return <div className="cms-wizard-backdrop"><section ref={dialogRef} className="cms-wizard" role="dialog" aria-busy={busy} onKeyDown={keepFocus} aria-modal="true" aria-labelledby="new-vehicle-title"><header><div><span className="cms-small-label">Build your collection</span><h2 id="new-vehicle-title">Add a vehicle</h2></div><button type="button" disabled={busy} aria-label="Close without saving vehicle" onClick={onClose}><X size={20}/></button></header><VehicleEditingFlow vehicle={draft} photos={photos} onChange={change=>setDraft(current=>({...current,...change}))} onPhotoAdded={photo=>setDraft(current=>editVehiclePhoto(current,{type:"add",photo:{...photo,alt:`${current.name} — ${photo.label}`}}))} onRefresh={onRefresh} onSave={()=>void commit()} busy={busy} dirty newVehicle canPublish={canPublish} allowUpload={allowUpload} onUploadBusy={setBusy}/>{error&&<p role="alert" className="cms-auth-error">{error}</p>}</section></div>;
}
