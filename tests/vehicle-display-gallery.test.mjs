import test from 'node:test';
import assert from 'node:assert/strict';
let display={};try{display=await import('../lib/vehicle-display-gallery.ts');}catch{}
test('detail gallery honors exact saved photographs and cover without replacing the first with a cinematic scene',()=>{
  assert.equal(typeof display.vehicleDisplayGallery,'function');
  const vehicle={slug:'lexus-lx-600',image:'/api/media/new-rear.webp',featuredImage:'/old-scene.webp',gallery:[{src:'/api/media/front.webp',alt:'Actual front',label:'Front'},{src:'/api/media/new-rear.webp',alt:'Actual rear',label:'Rear'}]};
  const result=display.vehicleDisplayGallery(vehicle);
  assert.deepEqual(result.photos.map(photo=>photo.src),['/api/media/front.webp','/api/media/new-rear.webp']);
  assert.equal(result.coverIndex,1);assert.equal(vehicle.gallery[0].src,'/api/media/front.webp');
});
test('a legacy lead not present in the gallery safely uses the first real saved view, never an invented fallback',()=>{
  assert.equal(typeof display.vehicleDisplayGallery,'function');
  assert.deepEqual(display.vehicleDisplayGallery({image:'/separate-lead.webp',gallery:[]}),{photos:[],coverIndex:0});
  assert.equal(display.vehicleDisplayGallery({image:'/separate-lead.webp',gallery:[{src:'/actual.webp',label:'Actual',alt:'Saved view'}]}).coverIndex,0);
});
