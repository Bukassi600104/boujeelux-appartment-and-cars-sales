import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoundedUploadQueue} from '../lib/media-upload-queue';

test('one global queue deduplicates an item and never exceeds two concurrent uploads',async()=>{
 const queue=createBoundedUploadQueue(2);let active=0,max=0;const calls=new Map<string,number>();
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 const work=(id:string)=>queue.run(id,async()=>{calls.set(id,(calls.get(id)??0)+1);active++;max=Math.max(max,active);await gate;active--;return id;});
 const first=work('one'),duplicate=work('one'),second=work('two'),third=work('three'),manual=work('four');
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(active,2);assert.equal(calls.get('one'),1);assert.equal(max,2);
 release();
 assert.deepEqual(await Promise.all([first,duplicate,second,third,manual]),['one','one','two','three','four']);
 assert.equal(max,2);assert.equal(calls.get('one'),1);
});
