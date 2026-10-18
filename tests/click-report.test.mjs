import test from 'node:test';
import assert from 'node:assert/strict';
import {buildClickReport} from '../shared-cms/click-report.mjs';
const now=new Date('2026-10-18T23:15:00Z'); // Monday 00:15 in Lagos
test('daily report uses Lagos midnight with matching graph and count, no invented history',()=>{
 const r=buildClickReport({startedAt:'2026-10-18T23:00:00Z',buckets:[{bucketStart:'2026-10-18T22:00:00Z',count:50},{bucketStart:'2026-10-18T23:00:00Z',count:2}],legacyTotal:6},'daily',now);
 assert.equal(r.total,2);assert.equal(r.points.length,24);assert.equal(r.points[0].count,2);assert.equal(r.points[1].count,null);assert.equal(r.previous,null);assert.equal(r.timeZone,'Africa/Lagos');assert.equal(r.legacyTotal,6);
});
test('weekly monthly and yearly intervals each use true calendar boundaries',()=>{
 for(const [period,length]of [['weekly',7],['monthly',31],['yearly',12]]){
  const r=buildClickReport({startedAt:'2026-01-01T00:00:00Z',buckets:[{bucketStart:'2026-10-18T23:00:00Z',count:3}]},period,now);
  assert.equal(r.points.length,length);assert.equal(r.total,3);assert.equal(r.points.reduce((s,p)=>s+(p.count??0),0),r.total);
 }
});
test('comparisons require actual previous coverage and compare same elapsed time',()=>{
 const r=buildClickReport({startedAt:'2026-10-01T00:00:00Z',buckets:[{bucketStart:'2026-10-17T23:00:00Z',count:2},{bucketStart:'2026-10-18T23:00:00Z',count:4},{bucketStart:'2026-10-19T00:00:00Z',count:100}]},'daily',new Date('2026-10-19T00:15:00Z'));
 assert.deepEqual(r.previous,{total:2,current:4,through:'2026-10-19T00:00:00.000Z',changePercent:100});assert.equal(r.total,104,'Current partial hour is counted but never compared against a full prior hour');
 const empty=buildClickReport({startedAt:'2026-10-18T23:05:00Z',buckets:[]},'monthly',now);assert.equal(empty.previous,null);assert.equal(empty.total,0);assert.equal(empty.points[0].count,null);
});
test('invalid periods, dates and counts cannot invent a report',()=>{
 assert.throws(()=>buildClickReport({buckets:[]},'forever',now));
 assert.throws(()=>buildClickReport({startedAt:'bad',buckets:[]},'daily',now));
 assert.throws(()=>buildClickReport({startedAt:'2026-01-01',buckets:[{bucketStart:'2026-10-18T23:00Z',count:-1}]},'daily',now));
});
