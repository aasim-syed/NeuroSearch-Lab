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

  const { items, setItems, reset } = useCorpus(dim);
  const { status, points, train, run, clear } = useBenchmark();

  // Pass args explicitly—don’t rely on async state
  const onTrain = async (nlistArg = nlist, mArg = m, ksArg = ks) => {
    await train(items, nlistArg, mArg, ksArg);
  };
  const onRun = async (label: string, nprobeArg = nprobe) => {
    await run(items, query, dim, k, nprobeArg, label);
  };

  const onGrid = async()=>{
    clear();
    const grid = [
      {m:4, ks:16, nprobe:1},
      {m:8, ks:16, nprobe:2},
      {m:8, ks:32, nprobe:2},
      {m:16, ks:16, nprobe:4},
      {m:16, ks:32, nprobe:4},
    ];
    for (const g of grid) {
      await onTrain(nlist, g.m, g.ks);
      await onRun(`m=${g.m}, ks=${g.ks}, nprobe=${g.nprobe}`, g.nprobe);
    }
  };

  const onUpload = async(newItems:CorpusItem[])=>{
    await setItems(newItems.map(x => ({ ...x, id: x.id ?? crypto.randomUUID() })));
    await saveCorpus("default", newItems); // stored by useCorpus anyway; harmless
  };

  const onReset = async ()=>{
    await reset();
    clear();
    console.log("[reset] storage cleared; change a slider or reload to re-seed");
  };

  return (
    <div className="container">
      <h1>NeuroLabs</h1>
      <div className="small">{status}</div>

      <div style={{display:"flex", gap:8, marginTop:8}}>
        <button className="button ghost" onClick={onReset}>Reset (clear storage)</button>
      </div>

      <div className="row" style={{marginTop:12}}>
        <div className="card">
          <div className="label">Query text</div>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)} />
          <div style={{display:"flex", gap:8, marginTop:10, flexWrap:'wrap'}}>
            <button className="button" onClick={()=>onTrain()}>Train IVF + PQ</button>
            <button className="button secondary" onClick={()=>onRun("custom")}>Run once</button>
            <button className="button" onClick={onGrid}>Benchmark grid</button>
          </div>
          <div className="small" style={{marginTop:8}}>Toy 3-gram embeddings to stay 100% local. Train again after changing params.</div>
        </div>
        <div className="card">
          <Controls label="Embedding dimension" value={dim} min={64} max={512} step={32} onChange={setDim} />
          <Controls label="Top-k" value={k} min={1} max={20} step={1} onChange={setK} />
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
