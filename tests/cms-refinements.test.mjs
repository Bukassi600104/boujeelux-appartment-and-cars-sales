import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
  commitVehicleDraft,
  chatClickContext,
  cropFrame,
  createVehicleDraft,
  dismissWhatsappReminder,
  mediaQueue,
  moveMedia,
  parseRecentVehicles,
  rememberVehicle,
  setMediaCover,
  shouldShowWhatsappReminder,
  updateMediaItem,
  validChatListingSlug,
} from "../lib/cms/refinements.ts";

test("an abandoned vehicle wizard never changes the catalogue", () => {
  const content={vehicles:[{slug:"existing",status:"published"}],revision:4};
  const draft=createVehicleDraft(1700000000000);
  assert.equal(content.vehicles.length,1);
  assert.equal(draft.slug,"new-vehicle-1700000000000");
  assert.equal(content.revision,4);
});

test("explicit draft and publish commits append exactly one vehicle", () => {
  const content={vehicles:[{slug:"existing",status:"published"}],settings:{}};
  const draft=createVehicleDraft(1700000000000);
  const saved=commitVehicleDraft(content,draft,"draft");
  assert.equal(saved.vehicles.length,2);
  assert.equal(saved.vehicles[1].status,"draft");
  const published=commitVehicleDraft(content,draft,"published");
  assert.equal(published.vehicles.length,2);
  assert.equal(published.vehicles[1].status,"published");
});

test("media queue preserves labels, cover and retry state without duplicates", () => {
  const files=[{name:"front.jpg",size:120,type:"image/jpeg"},{name:"cabin.jpg",size:90,type:"image/jpeg"}];
  let queue=mediaQueue(files);
  queue=updateMediaItem(queue,queue[0].id,{status:"error",error:"Upload failed"});
  queue=updateMediaItem(queue,queue[0].id,{status:"queued",error:""});
  queue=setMediaCover(queue,queue[1].id);
  queue=moveMedia(queue,1,0);
  assert.equal(queue.length,2);
  assert.equal(queue[0].name,"cabin.jpg");
  assert.equal(queue.filter(item=>item.cover).length,1);
  assert.equal(queue[0].cover,true);
  assert.equal(queue[1].status,"queued");
});

test("recent vehicles tolerate malformed storage, exclude current and unpublished, and remain bounded", () => {
  assert.deepEqual(parseRecentVehicles("not json",["a"],"a"),[]);
  assert.deepEqual(parseRecentVehicles('["missing","b","a","c","d","e"]',["a","b","c","d","e"],"a",3),["b","c","d"]);
  assert.deepEqual(rememberVehicle('["b","a"]',"c",3),["c","b","a"]);
});

test("WhatsApp reminder dismissal lasts for the browser session", () => {
  const storage=new Map();
  assert.equal(shouldShowWhatsappReminder(storage),true);
  dismissWhatsappReminder(storage);
  assert.equal(shouldShowWhatsappReminder(storage),false);
});

test("chat metric BFF routes hardwire authority and enforce mutation origin", async()=>{
  const publicRoute=await readFile(new URL("../app/api/chat-clicks/route.ts",import.meta.url),"utf8");
  const adminRoute=await readFile(new URL("../app/api/admin/metrics/route.ts",import.meta.url),"utf8");
  assert.match(publicRoute,/assertMutationOrigin\(request\)/);
  assert.match(publicRoute,/cmsRequest\("trackChat"/);
  assert.doesNotMatch(publicRoute,/site\s*:/);
  assert.match(adminRoute,/authorize\(\)/);
  assert.match(adminRoute,/cmsRequest\("metrics"/);
});

test("chat tracking permits general context but rejects malformed listing slugs",()=>{
  assert.equal(validChatListingSlug(""),true);
  assert.equal(validChatListingSlug("2019-toyota-corolla"),true);
  assert.equal(validChatListingSlug("../../admin"),false);
});

test("crop framing is bounded, uses the requested focal point, and never upscales",()=>{
  assert.deepEqual(cropFrame(2400,1600,"fit",50,50),{sx:0,sy:0,sw:2400,sh:1600,width:1920,height:1280});
  const cropped=cropFrame(2400,1600,"crop",100,50);
  assert.ok(Math.abs(cropped.sx-266.6667)<.001);
  assert.deepEqual({...cropped,sx:266.6667,sw:2133.3333},{sx:266.6667,sy:0,sw:2133.3333,sh:1600,width:1920,height:1440});
  assert.deepEqual(cropFrame(800,600,"crop",50,50),{sx:0,sy:0,sw:800,sh:600,width:800,height:600});
});

test("delegated WhatsApp tracking recognizes wa.me links and derives current listing context",()=>{
  assert.equal(chatClickContext("https://wa.me/2349118781995","/vehicles/2019-toyota-corolla",["2019-toyota-corolla"]),"2019-toyota-corolla");
  assert.equal(chatClickContext("https://wa.me/2349118781995?text=hello","/contact",["2019-toyota-corolla"]),"");
  assert.equal(chatClickContext("https://example.com","/contact",[]),null);
  assert.equal(chatClickContext("https://wa.me/2349118781995","/vehicles/private-draft",["published"]),"");
});

test("public assistance delegates all WhatsApp counting without a duplicate floating handler",async()=>{
  const component=await readFile(new URL("../components/public-assistance.tsx",import.meta.url),"utf8");
  const layout=await readFile(new URL("../app/layout.tsx",import.meta.url),"utf8");
  assert.match(component,/export function PublicChatTracker/);
  assert.doesNotMatch(component,/onClick=\{track\}/);
  assert.match(layout,/<PublicChatTracker/);
});
