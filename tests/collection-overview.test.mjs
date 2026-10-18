import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire,Module} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
let CollectionOverview;
try {
  const filename=fileURLToPath(new URL('../components/cms-collection-overview.tsx',import.meta.url));
  const loaded=new Module(filename);loaded.filename=filename;loaded.paths=createRequire(import.meta.url).resolve.paths('react');
  loaded._compile(ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
  CollectionOverview=loaded.exports.CollectionOverview;
} catch {}
const render=(props)=>renderToStaticMarkup(createElement(CollectionOverview,{onAdd(){},onManage(){},onNavigate(){},clicks:null,leads:[],...props}));
test('overview uses saved featured photography and actual publication counts, never invented performance',()=>{
  assert.equal(typeof CollectionOverview,'function');
  const html=render({vehicles:[{slug:'real-car',name:'Saved car title',make:'Lexus',year:'2025',image:'/plain.webp',featuredImage:'/approved-cinematic.webp',status:'published',availability:'Sold',showPrice:true,priceValue:265000000},{slug:'private',name:'Private draft',status:'draft',availability:'Available',image:'/draft.webp',showPrice:false}]});
  assert.match(html,/approved-cinematic.webp/);assert.match(html,/Saved car title/);assert.match(html,/₦265,000,000/);
  assert.match(html,/Sold/);assert.match(html,/Private draft/);assert.match(html,/Not loaded/);
  assert.doesNotMatch(html,/Revenue|Growth|\+\d+%|Lamborghini/);
});
test('empty overview has an intentional add action, zero real counts, and no seeded photograph or car',()=>{
  assert.equal(typeof CollectionOverview,'function');
  const html=render({vehicles:[],clicks:0});
  assert.match(html,/Your collection starts here/);assert.match(html,/Add your first vehicle/);
  assert.doesNotMatch(html,/<img|Lexus|Mercedes/);assert.match(html,/No vehicle listings yet/);
});
test('a saved desired-publication flag does not falsely claim that a private vehicle is live',()=>{
  const html=render({vehicles:[{slug:'private-prepared',name:'Prepared car',make:'Toyota',year:'2019',image:'/saved.webp',status:'published',availability:'Available',showPrice:false}],publishedSlugs:[],draftSlugs:['private-prepared']});
  assert.doesNotMatch(html,/>published<|From your published collection/);
  assert.match(html,/Saved draft/);
});
test('an unchanged archived record is not misrepresented as an outstanding draft change',()=>{
  const html=render({vehicles:[{slug:'archived',name:'Archived saved vehicle',make:'Toyota',year:'2019',image:'/archived.webp',status:'archived',availability:'Sold',showPrice:false}],publishedSlugs:[],draftSlugs:[]});
  assert.match(html,/>Archived</);assert.doesNotMatch(html,/>Saved draft</);
});
