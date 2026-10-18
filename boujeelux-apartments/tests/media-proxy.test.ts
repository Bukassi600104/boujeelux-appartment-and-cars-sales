import assert from 'node:assert/strict';
import test from 'node:test';
import {isSupportedMediaKey} from '../lib/cms-contract';

test('apartment media proxy accepts every supported image extension including AVIF',()=>{
  const stem='1234567890abcdef12345678';
  for(const extension of ['jpg','jpeg','png','webp','avif'])assert.equal(isSupportedMediaKey(`${stem}.${extension}`),true,extension);
  for(const extension of ['svg','html','mp4','exe'])assert.equal(isSupportedMediaKey(`${stem}.${extension}`),false,extension);
});
