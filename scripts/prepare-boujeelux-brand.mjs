// Encoding-only optimization of the approved image-tool extractions.
// No recolouring, redrawing or generative changes happen in this step.
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const [navSource,footerSource]=process.argv.slice(2);
if(!navSource||!footerSource)throw new Error('Provide the approved isolated navigation and footer PNG paths.');
const target=path.resolve('boujeelux-apartments/public/brand');
await mkdir(target,{recursive:true});
for(const [source,name] of [[navSource,'boujeelux-nav-transparent.png'],[footerSource,'boujeelux-footer-transparent.png']]){
 const output=path.join(target,name);
 const edge=name.includes('footer')?256:384;
 const info=await sharp(source,{limitInputPixels:16_000_000}).ensureAlpha().trim().resize({width:edge,height:edge,fit:'inside',withoutEnlargement:true}).png({compressionLevel:9,palette:false}).toFile(output);
 const stats=await sharp(output).stats();
 if(info.size>=180_000||stats.channels[3].min!==0||stats.channels[3].max!==255)throw new Error('Logo optimization did not preserve bounded, genuinely transparent artwork.');
 console.log(JSON.stringify({name,bytes:info.size,width:info.width,height:info.height,alpha:true}));
}
