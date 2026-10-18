import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire,Module} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

// Execute the real component's handlers with deterministic hooks. Synchronous
// effect setters are rejected, matching the lint rule that prompted this fix.
function settingsHarness(props){
  const cells=[],effects=[];let cursor=0,inEffect=false;
  const react={
    useState(initial){const index=cursor++;if(!(index in cells))cells[index]=typeof initial==='function'?initial():initial;return[cells[index],value=>{assert.equal(inEffect,false,'Do not synchronize editor state from an effect');cells[index]=typeof value==='function'?value(cells[index]):value;}];},
    useRef(initial){const index=cursor++;return cells[index]??=( {current:initial});},
    useMemo(calculate){cursor++;return calculate();},
    useEffect(effect,deps){const index=cursor++,before=cells[index];if(!before||deps.some((value,i)=>!Object.is(value,before[i]))){cells[index]=deps;effects.push(effect);}},
  };
  const filename=fileURLToPath(new URL('../components/cms-website-settings.tsx',import.meta.url));
  const loaded=new Module(filename),require=createRequire(import.meta.url);
  loaded.filename=filename;loaded.paths=require.resolve.paths('react');
  loaded.require=id=>id==='react'?react:id==='@/lib/cms/model'?{settingsSchema:{safeParse:data=>({success:true,data})}}:require(id);
  loaded._compile(ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
  let tree;
  return{
    render(){cursor=0;tree=loaded.exports.CmsWebsiteSettings(props);for(const effect of effects.splice(0)){inEffect=true;try{effect();}finally{inEffect=false;}}return tree;},
    find(predicate){return walk(tree).find(predicate);},
  };
}
function walk(node){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(walk);return[node,...walk(node.props?.children)];}
function text(node){if(node==null||typeof node==='boolean')return'';if(typeof node!=='object')return String(node);if(Array.isArray(node))return node.map(text).join('');return text(node.props?.children);}
function savedSettings(title){return{heroTitle:title,heroSubtitle:'Saved introduction',aboutTitle:'About',aboutText:'Saved business story',seoTitle:'Saved search title',seoDescription:'Saved description',siteUrl:'https://example.com',inspectionEnabled:true,sourcingEnabled:true,contact:{phones:[{display:'09000000000',href:'tel:09000000000'}],whatsapp:[{display:'09000000000',href:'https://wa.me/2349000000000'}],emails:['office@example.com'],instagram:'https://instagram.com/example'}};}

test('reopening website settings starts from the latest saved baseline without effect state cascades',async()=>{
  const saves=[];
  const props={settings:savedSettings('Original saved headline'),canEdit:true,canPublish:true,onPreview(){},onPublish(){},onSaveDraft(value){saves.push(value);props.settings=structuredClone(value);}};
  const harness=settingsHarness(props);
  const button=label=>harness.find(node=>node.type==='button'&&text(node)===label);
  const headline=()=>harness.find(node=>node.type==='textarea');
  const review=()=>{harness.find(node=>node.type==='form').props.onSubmit({preventDefault(){}});return harness.render();};
  harness.render();button(' Edit website content').props.onClick();harness.render();
  assert.equal(headline().props.value,'Original saved headline');
  headline().props.onChange({target:{value:'Cancelled change'}});harness.render();
  button('Cancel').props.onClick();harness.render();assert.equal(saves.length,0);

  // A fresh server snapshot can arrive while the modal is closed.
  props.settings=savedSettings('Latest server headline');harness.render();
  button(' Edit website content').props.onClick();harness.render();
  assert.equal(headline().props.value,'Latest server headline');
  headline().props.onChange({target:{value:'Reviewed new headline'}});harness.render();
  const reviewed=text(review());assert.match(reviewed,/BeforeLatest server headline/);assert.match(reviewed,/AfterReviewed new headline/);
  await button('Save draft').props.onClick();await Promise.resolve();harness.render();
  assert.equal(saves.length,1);assert.equal(saves[0].heroTitle,'Reviewed new headline');
  button(' Edit website content').props.onClick();harness.render();
  assert.equal(headline().props.value,'Reviewed new headline');
});
