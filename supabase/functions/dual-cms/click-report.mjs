import {CmsError} from './validation.mjs';
const HOUR=3600000,DAY=24*HOUR,OFFSET=HOUR;
const local=t=>new Date(t+OFFSET);
const utc=(y,m,d=1,h=0)=>Date.UTC(y,m,d,h)-OFFSET;
function bounds(period,time){const d=local(time),y=d.getUTCFullYear(),m=d.getUTCMonth(),day=d.getUTCDate();
 if(period==='daily')return [utc(y,m,day),utc(y,m,day+1)];
 if(period==='weekly'){const monday=day-(d.getUTCDay()+6)%7;return [utc(y,m,monday),utc(y,m,monday+7)];}
 if(period==='monthly')return [utc(y,m),utc(y,m+1)];
 if(period==='yearly')return [utc(y,0),utc(y+1,0)];
 throw new CmsError('Choose a valid reporting period.');
}
export function buildClickReport(raw,period,now=new Date()){
 const time=now.getTime(),started=Date.parse(raw.startedAt);if(!Number.isFinite(time)||!Number.isFinite(started))throw new CmsError('Click reporting has not been initialized.',503);
 const [start,end]=bounds(period,time),buckets=raw.buckets??[];
 for(const b of buckets)if(!Number.isFinite(Date.parse(b.bucketStart))||!Number.isSafeInteger(Number(b.count))||Number(b.count)<0)throw new CmsError('Click report could not be read.',503);
 const count=(from,to)=>buckets.reduce((sum,b)=>{const t=Date.parse(b.bucketStart);return sum+(t>=from&&t<to?Number(b.count):0);},0);
 const points=[];for(let at=start;at<end;){const d=local(at),next=period==='yearly'?utc(d.getUTCFullYear(),d.getUTCMonth()+1):at+(period==='daily'?HOUR:DAY);
  const label=period==='daily'?String(d.getUTCHours()).padStart(2,'0')+':00':period==='yearly'?new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'Africa/Lagos'}).format(at):new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Africa/Lagos'}).format(at);
  points.push({start:new Date(at).toISOString(),label,count:next<=started||at>time?null:count(at,Math.min(next,time+1)),partial:at<started&&next>started});at=next;
 }
 const total=points.reduce((sum,p)=>sum+(p.count??0),0),[prevStart,prevEnd]=bounds(period,start-1),elapsed=Math.floor(Math.min(time-start,prevEnd-prevStart)/HOUR)*HOUR,previous=started<=prevStart&&elapsed>0?count(prevStart,prevStart+elapsed):null,comparableCurrent=count(start,start+elapsed);
 return {period,timeZone:'Africa/Lagos',startedAt:new Date(started).toISOString(),range:{start:new Date(start).toISOString(),end:new Date(end).toISOString(),asOf:now.toISOString()},total,points,partial:started>start,previous:previous===null?null:{total:previous,current:comparableCurrent,through:new Date(start+elapsed).toISOString(),changePercent:previous>0?Math.round((comparableCurrent-previous)/previous*100):null},legacyTotal:Number(raw.legacyTotal)||0};
}
