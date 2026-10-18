import test from 'node:test';
import assert from 'node:assert/strict';
import {createVehicleDraft,mediaQueue,moveMedia,updateMediaItem} from '../lib/cms/refinements.ts';
let editor={};
try { editor=await import('../lib/cms/vehicle-editor.ts'); } catch {}
const original=()=>({name:'Saved Lexus',image:'/front.webp',alt:'Front view',featuredImage:'/front.webp',gallery:[{src:'/front.webp',alt:'Front view',label:'Front'},{src:'/rear.webp',alt:'Rear view',label:'Rear'}],specifications:[{label:'Fuel',value:'Petrol'}]});

test('visual photo ordering preserves the selected cover and original saved state',()=>{
  assert.equal(typeof editor.editVehiclePhoto,'function');
  const before=original();
  const result=editor.editVehiclePhoto(before,{type:'move',index:1,to:0});
  assert.deepEqual(result.gallery.map(photo=>photo.src),['/rear.webp','/front.webp']);
  assert.equal(result.image,'/front.webp');
  assert.deepEqual(before.gallery.map(photo=>photo.src),['/front.webp','/rear.webp']);
});
test('cover replacement and removal keep image references and descriptions coherent',()=>{
  assert.equal(typeof editor.editVehiclePhoto,'function');
  const replaced=editor.editVehiclePhoto(original(),{type:'replace',index:0,photo:{src:'/new.webp',alt:'New front',label:'Front'}});
  assert.equal(replaced.image,'/new.webp');assert.equal(replaced.featuredImage,'/new.webp');assert.equal(replaced.alt,'New front');
  const removed=editor.editVehiclePhoto(replaced,{type:'remove',index:0});
  assert.equal(removed.image,'/rear.webp');assert.equal(removed.featuredImage,'/rear.webp');assert.equal(removed.alt,'Rear view');
  assert.equal(editor.editVehiclePhoto(removed,{type:'remove',index:0}).gallery.length,1,'Last required photo cannot be removed');
});
test('choosing a cover changes no gallery ordering; photo edits and additions remain bounded',()=>{
  assert.equal(typeof editor.editVehiclePhoto,'function');
  const cover=editor.editVehiclePhoto(original(),{type:'cover',index:1});
  assert.equal(cover.image,'/rear.webp');assert.deepEqual(cover.gallery.map(photo=>photo.src),['/front.webp','/rear.webp']);
  const edited=editor.editVehiclePhoto(cover,{type:'update',index:1,change:{alt:'Rear three-quarter',label:'Rear detail'}});
  assert.equal(edited.alt,'Rear three-quarter');
  const added=editor.editVehiclePhoto(edited,{type:'add',photo:{src:'/side.webp',alt:'Side',label:'Side'}});
  assert.equal(added.gallery.length,3);assert.equal(added.image,'/rear.webp');
  assert.equal(editor.editVehiclePhoto(added,{type:'add',photo:added.gallery[0]}).gallery.length,3);
});
test('simple specification rows preserve immutable edits and reject incomplete rows before saving',()=>{
  assert.equal(typeof editor.editSpecification,'function');
  const before=original();let rows=editor.editSpecification(before.specifications,{type:'add'});
  assert.equal(rows.length,2);assert.equal(before.specifications.length,1);
  assert.equal(editor.incompleteSpecifications(rows),true);
  rows=editor.editSpecification(rows,{type:'update',index:1,change:{label:'Transmission',value:'Automatic'}});
  assert.equal(editor.incompleteSpecifications(rows),false);
  rows=editor.editSpecification(rows,{type:'remove',index:0});
  assert.deepEqual(rows,[{label:'Transmission',value:'Automatic'}]);
});

test('the guided editor validates only the current step without discarding saved fields',()=>{
  assert.equal(typeof editor.vehicleStepError,'function');
  const vehicle={...original(),slug:'saved-car',name:'Saved Lexus',make:'Lexus',year:'2025',priceValue:265000000};
  assert.equal(editor.vehicleStepError(vehicle,0),'');
  assert.match(editor.vehicleStepError({...vehicle,name:''},0),/name/i);
  assert.equal(editor.vehicleStepError({...vehicle,specifications:[{label:'',value:''}]},0),'');
  assert.match(editor.vehicleStepError({...vehicle,specifications:[{label:'',value:''}]},1),/specification/i);
  assert.match(editor.vehicleStepError({...vehicle,priceValue:-1},2),/price/i);
  assert.match(editor.vehicleStepError({...vehicle,gallery:[]},3),/photograph/i);
  assert.equal(editor.vehicleStepError(vehicle,4),'');
});

test('a new draft has no fabricated name, make, model year or photograph',()=>{
  const draft=createVehicleDraft(1700000000000);
  assert.equal(draft.name,'');assert.equal(draft.make,'');assert.equal(draft.year,'');
  assert.equal(draft.image,'');assert.deepEqual(draft.gallery,[]);
  const photographed=editor.editVehiclePhoto(draft,{type:'add',photo:{src:'/real.webp',alt:'Actual car',label:'Front'}});
  assert.equal(photographed.image,'/real.webp');assert.equal(photographed.alt,'Actual car');
});

test('reordered distinct files retain their own source file, preview, uploaded URL and label',async()=>{
  const first=new File(['distinct front bytes'],'front.jpg',{type:'image/jpeg'});
  const second=new File(['distinct cabin bytes'],'interior.jpg',{type:'image/jpeg'});
  const queued=mediaQueue([first,second]);
  let reordered=moveMedia(queued,1,0);
  reordered=updateMediaItem(reordered,queued[0].id,{preview:'blob:front',src:'/api/media/unique-front.webp',status:'uploaded'});
  reordered=updateMediaItem(reordered,queued[1].id,{preview:'blob:cabin',src:'/api/media/unique-cabin.webp',status:'uploaded'});
  assert.equal(await reordered[0].file.text(),'distinct cabin bytes');
  assert.equal(reordered[0].src,'/api/media/unique-cabin.webp');assert.equal(reordered[0].preview,'blob:cabin');assert.equal(reordered[0].label,'Interior');
  assert.equal(await reordered[1].file.text(),'distinct front bytes');
  assert.equal(reordered[1].src,'/api/media/unique-front.webp');assert.equal(reordered[1].preview,'blob:front');
});

test('media library merges real saved references and uploads by URL, not filename or invented size',()=>{
  assert.equal(typeof editor.vehicleMediaLibrary,'function');
  const vehicle={...original(),name:'Saved car',featuredImage:'/scene.webp'};
  const library=editor.vehicleMediaLibrary([vehicle],[{key:'one.webp',name:'front.jpg',type:'image/webp',size:1200},{key:'two.webp',name:'front.jpg',type:'image/webp',size:1800}]);
  assert.deepEqual(library.map(photo=>photo.src),['/front.webp','/scene.webp','/rear.webp','/api/media/one.webp','/api/media/two.webp']);
  assert.equal(library[0].size,null);assert.equal(library[0].origin,'From saved vehicle gallery');
  assert.equal(library[3].size,1200);assert.equal(library[4].size,1800);
  assert.deepEqual(editor.vehicleMediaLibrary([],[]),[]);
});
