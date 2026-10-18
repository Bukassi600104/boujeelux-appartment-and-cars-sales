import test from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../lib/cms/preview.ts').catch(()=>({}));
test('saved draft preview requires full first-login completion',()=>{
 assert.equal(typeof api.previewRedirect,'function');assert.equal(api.previewRedirect(null),'/admin/login');assert.equal(api.previewRedirect({mustChange:true}),'/admin/credentials');assert.equal(api.previewRedirect({mustChange:false}),null);
});
test('approved Lexus hero is never relabelled as another selected or missing car',()=>{
 assert.equal(typeof api.heroImageVehicle,'function');
 const lx={slug:'lexus-lx-600',name:'2025 Lexus LX 600',make:'Lexus',status:'published'};const toyota={slug:'corolla',name:'Toyota Corolla',make:'Toyota',status:'published'};
 assert.equal(api.heroImageVehicle('/hero-lexus-sunset.webp',[toyota,lx])?.slug,'lexus-lx-600');
 assert.equal(api.heroImageVehicle('/hero-lexus-sunset.webp',[toyota]),undefined);assert.equal(api.heroImageVehicle('/different-hero.webp',[lx]),undefined);assert.equal(api.heroImageVehicle('/hero-lexus-sunset.webp',[{...lx,status:'draft'}]),undefined);
});
test('preview vehicle links remain private and contact actions are disabled without touching public navigation',()=>{
 assert.equal(typeof api.previewLinkTarget,'function');
 assert.equal(api.previewLinkTarget('/vehicles/lexus-lx-600'),'/admin/preview/vehicles/lexus-lx-600');assert.equal(api.previewLinkTarget('/'),'/admin/preview');
 assert.equal(api.previewLinkTarget('/admin'),'/admin');assert.equal(api.previewLinkTarget('https://wa.me/2347000000000'),null);assert.equal(api.previewLinkTarget('mailto:owner@example.com'),null);assert.equal(api.previewLinkTarget('tel:+2347000000000'),null);assert.equal(api.previewLinkTarget('#inventory'),'#inventory');
});
