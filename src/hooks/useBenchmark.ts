import { useRef, useState } from "react"; 
import type { BenchmarkPoint, CorpusItem, IVF, PQ } from "../lib/types"; 

export function useBenchmark(){
  const [status,setStatus]=useState("Idle");
  const [points,setPoints]=useState<BenchmarkPoint[]>([]);
  const ivfRef = useRef<IVF>(); 
  const pqRef = useRef<PQ>(); 
  const codesRef = useRef<number[][]>();

  const train = (items:CorpusItem[], nlist:number, m:number, ks:number)=> new Promise<void>((resolve)=>{
    const w = new Worker(new URL("../workers/trainWorker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e:MessageEvent)=>{ 
      const {ivf,pq,codes}=e.data; 
      ivfRef.current=ivf; pqRef.current=pq; codesRef.current=codes; 
      setStatus(`Trained IVF(nlist=${nlist}) + PQ(m=${m}, ks=${ks})`); 
      w.terminate(); resolve(); 
    };
    w.postMessage({ items, nlist, m, ks });
  });

  const run = (items:CorpusItem[], query:string, dim:number, k:number, nprobe:number, label:string)=> new Promise<BenchmarkPoint>((resolve)=>{
    const w = new Worker(new URL("../workers/queryWorker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e:MessageEvent)=>{ 
      const { recall, latency } = e.data; 
      const pt={ id:`${label}-${points.length}`, recall:Number(recall.toFixed(3)), latency, label }; 
      setPoints(p=>[...p, pt]); 
      setStatus(`Ran ${label} → recall@${k}=${recall.toFixed(2)}, ${latency}ms`); 
      w.terminate(); resolve(pt); 
    };
    w.postMessage({ items, ivf:ivfRef.current!, pq:pqRef.current!, codes:codesRef.current!, query, dim, k, nprobe });
  });

  const clear=()=>setPoints([]);
  return { status, points, train, run, clear };
}
