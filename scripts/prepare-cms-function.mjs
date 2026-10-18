import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const sourceDir=path.join(root,'shared-cms');
const targetDir=path.join(root,'supabase','functions','dual-cms');
const names=['core.mjs','repository.mjs','validation.mjs'];
const check=process.argv.includes('--check');
await mkdir(targetDir,{recursive:true});
const index=await readFile(path.join(targetDir,'index.ts'),'utf8');
for(const name of names){
  if(!index.includes(`./${name}`) && name!=='validation.mjs')throw new Error(`Edge entrypoint does not import ${name}`);
  const source=await readFile(path.join(sourceDir,name));
  const target=path.join(targetDir,name);
  if(check){
    try{await access(target);const current=await readFile(target);if(!current.equals(source))throw new Error(`${name} is stale; run node scripts/prepare-cms-function.mjs`);}catch(error){if(error?.code!=='ENOENT')throw error;}
  }else await writeFile(target,source);
}
console.log(check?'CMS function sources are canonical or ready to materialize.':'CMS function sources prepared for Supabase CLI deployment.');
