import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('media-only administrators have a real private library and bounded uploader',async()=>{
 const admin=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
 const media=await readFile(new URL('../components/cms-media-library.tsx',import.meta.url),'utf8');
 assert.match(admin,/WhatsApp clicks[\s\S]*Media library/);
 assert.match(admin,/<CmsMediaLibrary canUpload=\{permissions\.manageMedia\}\/>/);
 assert.match(media,/\/api\/cms\/mediaList/);
 assert.match(media,/method:'POST'/);
 assert.match(media,/runNormalizedUpload/);
 assert.match(media,/createBoundedUploadQueue\(2\)/);
 assert.match(media,/scheduler\.run\(item\.id/);
 assert.match(media,/new Map/);
 assert.match(media,/Choose an apartment and edit its gallery/);
 assert.doesNotMatch(media,/mock|placeholder|fake file size/i);
});
