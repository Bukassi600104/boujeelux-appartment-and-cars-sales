export function createBoundedUploadQueue(limit=2){
 let active=0;
 const waiting:Array<()=>void>=[],inFlight=new Map<string,Promise<unknown>>();
 function pump(){while(active<limit&&waiting.length){active++;waiting.shift()!();}}
 function run<T>(key:string,task:()=>Promise<T>):Promise<T>{
  const existing=inFlight.get(key);if(existing)return existing as Promise<T>;
  const promise=new Promise<T>((resolve,reject)=>{waiting.push(()=>{void task().then(resolve,reject).finally(()=>{active--;inFlight.delete(key);pump();});});pump();});
  inFlight.set(key,promise);return promise;
 }
 return{run};
}
