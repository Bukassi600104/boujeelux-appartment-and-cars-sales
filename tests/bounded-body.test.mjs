import assert from "node:assert/strict";
import test from "node:test";
import {readBoundedFormData,readBoundedText} from "../lib/cms/bounded-body.ts";

function streamingRequest(chunks,{contentLength}={}){
  let cancelled=false;
  let index=0;
  const body=new ReadableStream({
    pull(controller){if(index<chunks.length)controller.enqueue(new TextEncoder().encode(chunks[index++]));else controller.close();},
    cancel(){cancelled=true;},
  });
  const headers=contentLength===undefined?{}:{"content-length":String(contentLength)};
  return {request:new Request("https://example.test/api",{method:"POST",headers,body,duplex:"half"}),cancelled:()=>cancelled};
}

test("bounded text cancels an oversized stream when Content-Length is absent",async()=>{
  const source=streamingRequest(["1234","5678"]);
  await assert.rejects(()=>readBoundedText(source.request,6),error=>error?.status===413);
  assert.equal(source.cancelled(),true);
});

test("bounded text ignores a lying small Content-Length and cancels at the byte cap",async()=>{
  const source=streamingRequest(["1234","5678"],{contentLength:2});
  await assert.rejects(()=>readBoundedText(source.request,6),error=>error?.status===413);
  assert.equal(source.cancelled(),true);
});

test("bounded text preserves malformed JSON for the route parser to reject",async()=>{
  const source=streamingRequest(["{bad"]);
  assert.equal(await readBoundedText(source.request,100),"{bad");
  assert.throws(()=>JSON.parse("{bad"),SyntaxError);
});

async function multipartFixture(bytes,contentLength){
  const form=new FormData();
  form.set("file",new File([bytes],"sample.webp",{type:"image/webp"}));
  const encoded=new Request("https://example.test/upload",{method:"POST",body:form});
  const payload=new Uint8Array(await encoded.arrayBuffer());
  let offset=0,cancelled=false;
  const body=new ReadableStream({pull(controller){if(offset>=payload.length)return controller.close();const end=Math.min(payload.length,offset+7);controller.enqueue(payload.slice(offset,end));offset=end;},cancel(){cancelled=true;}});
  const headers={"content-type":encoded.headers.get("content-type")};
  if(contentLength!==undefined)headers["content-length"]=String(contentLength);
  return {request:new Request("https://example.test/upload",{method:"POST",headers,body,duplex:"half"}),cancelled:()=>cancelled};
}

for(const [name,contentLength] of [["absent",undefined],["dishonest",2]])test(`bounded multipart cancels oversized streams with ${name} Content-Length`,async()=>{
  const source=await multipartFixture(new Uint8Array(80).fill(7),contentLength);
  await assert.rejects(()=>readBoundedFormData(source.request,60),error=>error?.status===413);
  assert.equal(source.cancelled(),true);
});

test("bounded multipart preserves valid binary files and metadata",async()=>{
  const expected=new Uint8Array([0,255,1,254,2,253]);
  const source=await multipartFixture(expected);
  const form=await readBoundedFormData(source.request,1000);
  const file=form.get("file");
  assert.ok(file instanceof File);
  assert.equal(file.name,"sample.webp");
  assert.equal(file.type,"image/webp");
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()),expected);
});
