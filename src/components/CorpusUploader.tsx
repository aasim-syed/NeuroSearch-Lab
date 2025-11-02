import React from "react"; import type { CorpusItem } from "../lib/types"; import { hash3gram } from "../lib/embeddings";
export function CorpusUploader({dim,onLoaded}:{dim:number; onLoaded:(items:CorpusItem[])=>void}){
  const onFile = async (f:File)=>{ const text=await f.text(); try{
      if(f.name.endsWith('.json')){ const arr=JSON.parse(text); const items:CorpusItem[]=arr.map((x:any,i:number)=>({ id:x.id||`doc_${i}`, text:x.text||String(x), v:hash3gram(x.text||String(x), dim)})); onLoaded(items);
      } else { const lines=text.split(/\r?\n/).filter(Boolean); const header=lines.shift()?.split(',')||[]; const tIdx=header.findIndex(h=>h.trim().toLowerCase()==='text'); if(tIdx===-1) throw new Error('CSV needs a `text` column'); const items:CorpusItem[]=lines.map((row,i)=>{ const cols=row.split(','); const t=cols[tIdx]; return { id:`doc_${i}`, text:t, v:hash3gram(t, dim)};}); onLoaded(items);} }
    catch(err:any){ alert(`Load error: ${err.message}`); } };
  return (
    <div>
      <div className="label">Upload corpus (CSV with `text` or JSON array)</div>
      <input className="input" type="file" accept=".csv,.json" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) onFile(f); }} />
    </div>
  );
}
