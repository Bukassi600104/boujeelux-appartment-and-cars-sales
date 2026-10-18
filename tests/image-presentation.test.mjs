import test from 'node:test';
import assert from 'node:assert/strict';
import assets from '../lib/cms/assets.json' with {type:'json'};
import {imageSources,imageVariant} from '../lib/image-presentation.ts';

const tracked=new Set(assets);

test('saved gallery originals without optimized exports keep their actual source',()=>{
  const source='/vehicles/2018-mercedes-benz-gle-350/rear.jpeg';
  assert.equal(tracked.has(source),true);
  for(const size of [480,960,'thumb'])assert.equal(imageVariant(source,size),source);
  assert.equal(imageSources(source),'','Preloads must not invent missing responsive exports');
});

test('known optimized exports and their actual responsive widths are preserved',()=>{
  const source='/inventory/lexus-lx600.webp';
  assert.equal(imageVariant(source,'thumb'),'/optimized/thumb/inventory/lexus-lx600.webp');
  assert.equal(imageSources(source),'/optimized/480/inventory/lexus-lx600.webp 480w, /optimized/960/inventory/lexus-lx600.webp 570w');
});

test('uploads and arbitrary sources are never rewritten into fabricated optimized URLs',()=>{
  for(const source of ['/api/media/client-photo.webp','https://example.com/client-photo.jpg','/new-saved-photo.png']){
    for(const size of [480,960,'thumb'])assert.equal(imageVariant(source,size),source);
    assert.equal(imageSources(source),'');
  }
});

test('every generated gallery variant and srcset entry exists in the tracked asset manifest',()=>{
  for(const source of assets.filter(asset=>!asset.startsWith('/optimized/'))){
    for(const size of [480,960,'thumb']){
      const variant=imageVariant(source,size);
      assert.ok(variant===source||tracked.has(variant),`Untracked variant ${variant}`);
    }
    for(const entry of imageSources(source).split(',').filter(Boolean)){
      const [path,width]=entry.trim().split(' ');
      assert.ok(tracked.has(path),`Untracked responsive image ${path}`);
      assert.match(width,/^\d+w$/);
    }
  }
});
