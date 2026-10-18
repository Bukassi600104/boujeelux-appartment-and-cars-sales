type Photo={src:string;alt:string;label:string};
export function vehicleDisplayGallery(vehicle:{image:string;gallery:Photo[]}){
  const photos=vehicle.gallery.map(photo=>({...photo}));
  return {photos,coverIndex:Math.max(0,photos.findIndex(photo=>photo.src===vehicle.image))};
}
