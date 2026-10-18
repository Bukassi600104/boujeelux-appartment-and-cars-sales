import type {CmsVehicle} from "./model";
type Photo=CmsVehicle["gallery"][number];
type PhotoAction={type:"add";photo:Photo}|{type:"remove";index:number}|{type:"cover";index:number}|{type:"move";index:number;to:number}|{type:"replace";index:number;photo:Photo}|{type:"update";index:number;change:Partial<Pick<Photo,"label"|"alt">>};

/** Gallery actions never mutate saved content or leave a removed cover referenced. */
export function editVehiclePhoto<T extends Pick<CmsVehicle,"gallery"|"image"|"alt"|"featuredImage">>(vehicle:T,action:PhotoAction):T{
  const gallery=vehicle.gallery.map(photo=>({...photo}));
  if(action.type==="add"){
    if(gallery.length>=40||gallery.some(photo=>photo.src===action.photo.src))return vehicle;
    gallery.push({...action.photo});return {...vehicle,gallery,...(!vehicle.image?{image:action.photo.src,alt:action.photo.alt}:{})};
  }
  const photo=gallery[action.index];if(!photo)return vehicle;
  if(action.type==="cover")return {...vehicle,image:photo.src,alt:photo.alt};
  if(action.type==="move"){
    if(action.to<0||action.to>=gallery.length)return vehicle;
    const [moved]=gallery.splice(action.index,1);gallery.splice(action.to,0,moved);return {...vehicle,gallery};
  }
  if(action.type==="remove"){
    if(gallery.length===1)return vehicle;gallery.splice(action.index,1);
  }else gallery[action.index]=action.type==="replace"?{...action.photo}:{...photo,...action.change};
  const replacement=action.type==="remove"?gallery[0]:gallery[action.index];
  return {...vehicle,gallery,...(vehicle.image===photo.src?{image:replacement.src,alt:replacement.alt}:{}),...(vehicle.featuredImage===photo.src?{featuredImage:replacement.src}:{})};
}
type Specification=CmsVehicle["specifications"][number];
type SpecificationAction={type:"add"}|{type:"remove";index:number}|{type:"update";index:number;change:Partial<Specification>};
export function editSpecification(rows:Specification[],action:SpecificationAction):Specification[]{
  if(action.type==="add")return rows.length>=30?rows:[...rows,{label:"",value:""}];
  if(action.type==="remove")return rows.filter((_,index)=>index!==action.index);
  return rows.map((row,index)=>index===action.index?{...row,...action.change}:row);
}
export function incompleteSpecifications(rows:Specification[]){return rows.some(row=>!row.label.trim()||!row.value.trim());}
export function vehicleStepError(vehicle:CmsVehicle,step:number):string{
  if(step===0){if(vehicle.name.trim().length<3)return "Enter the vehicle name (at least three characters).";if(!vehicle.make.trim())return "Enter the vehicle make.";if(!/^(19|20)\d{2}$/.test(vehicle.year))return "Enter a four-digit model year.";if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(vehicle.slug)||vehicle.slug.length>100)return "Use a page address containing lowercase letters, numbers and single hyphens.";}
  if(step===1&&incompleteSpecifications(vehicle.specifications))return "Complete each specification name and value, or remove unused rows.";
  if(step===2&&(!Number.isFinite(vehicle.priceValue)||vehicle.priceValue<0||vehicle.priceValue>10_000_000_000))return "Enter a valid price from 0 to 10 billion naira.";
  if(step===3){if(!vehicle.gallery.length)return "Add at least one vehicle photograph.";if(vehicle.gallery.some(photo=>!photo.label.trim()||!photo.alt.trim()))return "Give each photograph a view label and image description.";}
  return "";
}
export function vehicleMediaLibrary(vehicles:Pick<CmsVehicle,"name"|"image"|"alt"|"featuredImage"|"gallery">[],uploads:{key:string;name:string;type:string;size:number}[]){
  const saved=vehicles.flatMap(vehicle=>[{src:vehicle.image,alt:vehicle.alt,label:`${vehicle.name} · Cover`},...(vehicle.featuredImage?[{src:vehicle.featuredImage,alt:vehicle.alt,label:`${vehicle.name} · Homepage`}]:[]),...vehicle.gallery]).filter(photo=>photo.src);
  const photos=[...saved.map(photo=>({...photo,origin:"From saved vehicle gallery",size:null as number|null})),...uploads.filter(item=>item.type.startsWith("image/")).map(item=>({src:`/api/media/${item.key}`,alt:item.name,label:item.name,origin:"Uploaded photograph",size:item.size}))];
  return [...new Map(photos.map(photo=>[photo.src,photo])).values()];
}
