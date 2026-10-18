import assert from 'node:assert/strict';
import test from 'node:test';
import {coverCropGeometry} from '../lib/image-normalizer';
import {runNormalizedUpload} from '../lib/upload-workflow';

test('cover crop geometry applies focal position and zoom inside source bounds',()=>{
  assert.deepEqual(coverCropGeometry(4000,3000,4/3,.5,.5,1),{sx:0,sy:0,sw:4000,sh:3000});
  assert.deepEqual(coverCropGeometry(4000,3000,1,.75,.25,2),{sx:1875,sy:375,sw:1500,sh:1500});
});

test('shared upload path sends only normalized output and keeps source file unchanged',async()=>{
  const source=new File(['original'],'room.jpg',{type:'image/jpeg'});let sent:unknown;
  const result=await runNormalizedUpload(source,'Suite',{focalX:.2,focalY:.8,zoom:1.4},{normalize:async(file,crop)=>{assert.equal(file,source);assert.equal(crop.zoom,1.4);return{base64:'optimized',type:'image/webp' as const,width:1200,height:900,warning:''};},send:async payload=>{sent=payload;return{src:'/api/media/new.webp'};}});
  assert.deepEqual(sent,{base64:'optimized',type:'image/webp',name:'room.webp'});
  assert.equal(await source.text(),'original');
  assert.equal(result.photo.label,'Property view');
});
