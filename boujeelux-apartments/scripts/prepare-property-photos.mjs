import {mkdir,readdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import sharp from 'sharp';

// Non-generative corrections explicitly approved by the user on 17 October 2026.
// No cropping, resizing, compositing, content-aware fills or synthetic detail.
const root=resolve(import.meta.dirname,'..');
const source=join(root,'asset-sources','selected-20','Individual Photos');
const masters=join(root,'asset-sources','photographic-masters');
const output=join(root,'public','images');
await mkdir(masters,{recursive:true});
await mkdir(output,{recursive:true});
const files=(await readdir(source)).filter(file=>/^\d{2}_.*\.jpg$/.test(file)).sort();
if(files.length!==20)throw new Error(`Expected 20 individual originals; found ${files.length}`);
// Small channel corrections retain the real decorative lighting and furnishings.
const corrections={
  1:{brightness:1.015,saturation:.97,gains:[.995,1,1.018]},
  2:{brightness:1.025,saturation:.97,gains:[1.012,1,1.008]},
  3:{brightness:1.02,saturation:.96,gains:[1.008,1,1.006]},
  4:{brightness:1.03,saturation:.97,gains:[1.008,1,1.006]},
  5:{brightness:1.015,saturation:.94,gains:[.995,1.015,.995]},
  6:{brightness:1.015,saturation:.96,gains:[.995,1.005,1.012]},
  7:{brightness:1.025,saturation:.96,gains:[1.025,1,.99]},
  8:{brightness:1.025,saturation:.97,gains:[1,1.005,1.005]},
  9:{brightness:1.015,saturation:.94,gains:[.995,1.012,.995]},
  10:{brightness:1.035,saturation:.96,gains:[.995,1.008,1.005]},
  11:{brightness:1.025,saturation:.97,gains:[1,1,1.008]},
  12:{brightness:1.015,saturation:.97,gains:[1,1,1.008]},
  13:{brightness:1.025,saturation:.97,gains:[1,1,1.008]},
  14:{brightness:1.02,saturation:.97,gains:[1,1,1.008]},
  15:{brightness:1.015,saturation:.96,gains:[.995,1,1.015]},
  16:{brightness:1.025,saturation:.97,gains:[1,1,1.008]},
  17:{brightness:1.025,saturation:.97,gains:[1,1,1.008]},
  18:{brightness:1.015,saturation:.97,gains:[1.008,1,.995]},
  19:{brightness:1.02,saturation:.94,gains:[1,1,1]},
  20:{brightness:1.03,saturation:.94,gains:[1,1,1]},
};
const manifest=[];
for(const file of files){
  const id=Number(file.slice(0,2));
  const config=corrections[id];
  const name='boujeelux-'+file.replaceAll('_','-').replace(/\.jpg$/,'.webp');
  const input=join(source,file);
  const meta=await sharp(input).metadata();
  if(meta.width!==512||meta.height!==910)throw new Error(`Unexpected source dimensions: ${file}`);
  const master=join(masters,name.replace(/\.webp$/,'.png'));
  const corrected=await sharp(input).rotate().toColourspace('srgb')
    .linear(config.gains,[0,0,0])
    .modulate({brightness:config.brightness,saturation:config.saturation})
    .sharpen({sigma:.5,m1:.2,m2:.6})
    .png().toBuffer();
  await writeFile(master,corrected);
  const info=await sharp(corrected).webp({quality:86,effort:6}).toFile(join(output,name));
  manifest.push({id,source:`asset-sources/selected-20/Individual Photos/${file}`,master:`asset-sources/photographic-masters/${name.replace(/\.webp$/,'.png')}`,website:`/images/${name}`,width:info.width,height:info.height,bytes:info.size,method:'Non-generative colour/exposure correction and restrained sharpening; original framing and contents unchanged',corrections:config});
}
await writeFile(join(masters,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const tiles=[];
for(const photo of manifest){
  const tile=await sharp(join(root,'public',photo.website)).resize(176,313).toBuffer();
  tiles.push({input:tile,left:16+(photo.id-1)%5*196,top:16+Math.floor((photo.id-1)/5)*345});
  const label=Buffer.from(`<svg width="176" height="22"><text x="0" y="16" font-family="Arial" font-size="13" fill="#173d32">Photo ${String(photo.id).padStart(2,'0')}</text></svg>`);
  tiles.push({input:label,left:16+(photo.id-1)%5*196,top:332+Math.floor((photo.id-1)/5)*345});
}
await sharp({create:{width:996,height:1396,channels:3,background:'#f7f2e8'}}).composite(tiles).jpeg({quality:85}).toFile(join(masters,'review-contact-sheet.jpg'));
console.log(JSON.stringify({images:manifest.length,totalBytes:manifest.reduce((sum,p)=>sum+p.bytes,0),maxBytes:Math.max(...manifest.map(p=>p.bytes)),manifest:join(masters,'manifest.json')}));
