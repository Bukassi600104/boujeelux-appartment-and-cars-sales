import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import sharp from 'sharp';
import {propertyPhotos} from '../lib/property-photos';

test('every supplied property photograph has its own lightweight, correctly proportioned website asset',async()=>{
  const paths=new Set<string>();
  for(const photo of propertyPhotos){
    const path=join(process.cwd(),'public',photo.src);
    assert.ok(existsSync(path),`Missing separate photo ${photo.id}: ${path}`);
    assert.ok(!paths.has(path),`Photo ${photo.id} incorrectly reuses another output`);
    paths.add(path);
    const meta=await sharp(path).metadata();
    assert.equal(meta.width,512,`Photo ${photo.id}: preserve source width; don't invent resolution`);
    assert.equal(meta.height,910,`Photo ${photo.id}: preserve complete portrait frame`);
    assert.ok(statSync(path).size<160000,`Photo ${photo.id}: website weight exceeds 160KB`);
  }
  assert.equal(paths.size,20);
});
