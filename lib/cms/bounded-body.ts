export class BodyTooLargeError extends Error{
  readonly status=413;
  constructor(){super("Request too large.");this.name="BodyTooLargeError";}
}

export async function readBoundedBytes(request:Request,maxBytes:number){
  const declared=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(declared)&&declared>maxBytes)throw new BodyTooLargeError();
  const reader=request.body?.getReader();
  if(!reader)return new Uint8Array();
  const chunks:Uint8Array[]=[];
  let size=0;
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    if(!value)continue;
    size+=value.byteLength;
    if(size>maxBytes){await reader.cancel();throw new BodyTooLargeError();}
    chunks.push(value);
  }
  const bytes=new Uint8Array(size);
  let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return bytes;
}

export async function readBoundedText(request:Request,maxBytes:number){return new TextDecoder().decode(await readBoundedBytes(request,maxBytes));}

export async function readBoundedFormData(request:Request,maxBytes:number){
  const contentType=request.headers.get("content-type");
  if(!contentType)throw new TypeError("Missing Content-Type header.");
  const bytes=await readBoundedBytes(request,maxBytes);
  const copy=Uint8Array.from(bytes).buffer;
  return new Request(request.url,{method:"POST",headers:{"content-type":contentType},body:copy}).formData();
}
