import React, { useState } from "react";
import { useCorpus } from "./hooks/useCorpus";
import { useBenchmark } from "./hooks/useBenchmark";
import { saveCorpus } from "./lib/storage";
import type { CorpusItem } from "./lib/types";
import { Controls } from "./components/Controls";
import { CorpusUploader } from "./components/CorpusUploader";
import { Chart } from "./components/Chart";
import { Footer } from "./components/Footer";

export default function App(){
  const [dim,setDim]=useState(128);
  const [m,setM]=useState(8);
  const [ks,setKs]=useState(16);
  const [nlist,setNlist]=useState(8);
  const [nprobe,setNprobe]=useState(2);
  const [k,setK]=useState(5);
  const [query,setQuery]=useState("vector compression tradeoffs");

  const { items, setItems } = useCorpus(dim);
  const { status, points, train, run, clear } = useBenchmark();

  const onTrain = async()=>{ await train(items, nlist, m, ks); };
  const onRun = async(label:string)=>{ await run(items, query, dim, k, nprobe, label); };
  const onGrid = async()=>{
    clear();
    const grid = [
      {m:4,ks:16,nprobe:1},
      {m:8,ks:16,nprobe:2},
      {m:8,ks:32,nprobe:2},
      {m:16,ks:16,nprobe:4},
      {m:16,ks:32,nprobe:4},
    ];
    for(const g of grid){ setM(g.m); setKs(g.ks); setNprobe(g.nprobe); await onTrain(); await onRun(`m=${g.m}, ks=${g.ks}, nprobe=${g.nprobe}`); }
  };

  const onUpload = async(newItems:CorpusItem[])=>{ setItems(newItems); await saveCorpus("default", newItems); };

  return (
    <div className="container">
      <h1>WebGPU Vector Compression Lab (Frontend‑only)</h1>
      <div className="small">{status}</div>

      <div className="row" style={{marginTop:12}}>
        <div className="card">
          <div className="label">Query text</div>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)} />
          <div style={{display:"flex", gap:8, marginTop:10}}>
            <button className="button" onClick={onTrain}>Train IVF + PQ</button>
            <button className="button secondary" onClick={()=>onRun("custom")} >Run once</button>
            <button className="button" onClick={onGrid}>Benchmark grid</button>
          </div>
          <div className="small" style={{marginTop:8}}>Toy 3‑gram embeddings to stay 100% local. Swap to Transformers.js later.</div>
        </div>
        <div className="card">
          <Controls label="Embedding dimension" value={dim} min={64} max={512} step={32} onChange={setDim} />
          <Controls label="Top‑k" value={k} min={1} max={20} step={1} onChange={setK} />
        </div>
      </div>

      <div className="row" style={{marginTop:12}}>
        <div className="card">
          <Controls label="IVF lists (nlist)" value={nlist} min={2} max={64} onChange={setNlist} />
          <Controls label="Probed lists (nprobe)" value={nprobe} min={1} max={Math.max(1,nlist)} onChange={setNprobe} />
        </div>
        <div className="card">
          <Controls label="Subquantizers (m)" value={m} min={2} max={32} onChange={setM} />
          <Controls label="Codebook size (ks)" value={ks} min={4} max={256} step={4} onChange={setKs} />
        </div>
      </div>

      <div className="row" style={{marginTop:12}}>
        <div className="card"><CorpusUploader dim={dim} onLoaded={onUpload} /></div>
        <div className="card"><Chart points={points} /></div>
      </div>

      <div style={{marginTop:12}} className="card"><Footer /></div>
    </div>
  );
}
