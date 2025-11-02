// @ts-nocheck
import type { IVF, PQ, CorpusItem } from "../lib/types"; 
import { hash3gram } from "../lib/embeddings"; 
import { adcDistance } from "../lib/pq";

self.onmessage = (e: MessageEvent)=>{
  const { items, ivf, pq, codes, query, dim, k, nprobe } = e.data as { items:CorpusItem[], ivf:IVF, pq:PQ, codes:number[][], query:string, dim:number, k:number, nprobe:number };
  const t0 = performance.now();
  const q = hash3gram(query, dim);
  // exact baseline (fast l2 via Math.hypot)
  const exact = items.map((d,idx)=>({ idx, d: Math.hypot(...d.v.map((x,i)=>x-q[i])) }))
                 .sort((a,b)=>a.d-b.d).slice(0,k).map(x=>x.idx);
  // IVF probe
  const candIds = ( ()=>{
    const d = ivf.centroids.map((c,idx)=>({ idx, d: Math.hypot(...c.map((x,i)=>x-q[i])) }))
      .sort((a,b)=>a.d-b.d).slice(0,Math.min(nprobe,ivf.centroids.length)).map(x=>x.idx);
    const ids:number[]=[]; for(const p of d) ids.push(...ivf.lists[p]); return ids;
  })();
  const scored = candIds.map(i=>({ idx:i, d: adcDistance(q, codes[i], pq)})).sort((a,b)=>a.d-b.d).slice(0,k).map(x=>x.idx);
  const recall = scored.filter(i=>exact.includes(i)).length/Math.max(1,k);
  const latency = Math.max(1, Math.round(performance.now()-t0));
  (self as any).postMessage({ exact, approx: scored, recall, latency });
};
