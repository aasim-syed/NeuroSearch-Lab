import React, { useState } from "react";
import { useCorpus } from "./hooks/useCorpus";
import { useBenchmark } from "./hooks/useBenchmark";
import { saveCorpus } from "./lib/storage";
import type { CorpusItem } from "./lib/types";
import { Controls } from "./components/Controls";
import { CorpusUploader } from "./components/CorpusUploader";
import { Chart } from "./components/Chart";
import { Footer } from "./components/Footer";
import { Walkthrough, type TourStep } from "./components/Walkthrough";

export default function App() {
  // ---- App state (UI + ANN params) ----
  const [dim, setDim] = useState(128);
  const [m, setM] = useState(8);
  const [ks, setKs] = useState(16);
  const [nlist, setNlist] = useState(8);
  const [nprobe, setNprobe] = useState(2);
  const [k, setK] = useState(5);
  const [query, setQuery] = useState("vector compression tradeoffs");
  const [tourOpen, setTourOpen] = useState(false);

  // ---- Data + benchmarking hooks ----
  const { items, setItems, reset } = useCorpus(dim);
  const { status, points, train, run, clear } = useBenchmark();

  // ---- Train/Run with explicit args (avoid stale state in loops) ----
  const onTrain = async (nlistArg = nlist, mArg = m, ksArg = ks) => {
    await train(items, nlistArg, mArg, ksArg);
  };
  const onRun = async (label: string, nprobeArg = nprobe) => {
    await run(items, query, dim, k, nprobeArg, label);
  };

  // ---- Benchmark grid sweep ----
  const onGrid = async () => {
    clear();
    const grid = [
      { m: 4, ks: 16, nprobe: 1 },
      { m: 8, ks: 16, nprobe: 2 },
      { m: 8, ks: 32, nprobe: 2 },
      { m: 16, ks: 16, nprobe: 4 },
      { m: 16, ks: 32, nprobe: 4 },
    ];
    for (const g of grid) {
      await onTrain(nlist, g.m, g.ks);
      await onRun(`m=${g.m}, ks=${g.ks}, nprobe=${g.nprobe}`, g.nprobe);
    }
  };

  // ---- Upload handler (IDs normalized; vectors embedded in useCorpus) ----
  const onUpload = async (newItems: CorpusItem[]) => {
    await setItems(
      newItems.map((x) => ({ ...x, id: x.id ?? (crypto?.randomUUID?.() || `doc_${Math.random()}`) }))
    );
    await saveCorpus("default", newItems); // harmless extra save; useCorpus persists too
  };

  // ---- Guided tour steps (unique anchors via data-tour attributes) ----
  const steps: TourStep[] = [
    {
      id: "uploader",
      title: "1) Load data",
      body: "Upload CSV/JSON with a `text` field, or use the demo seed.",
      anchor: '[data-tour="uploader"]',
    },
    {
      id: "ivf",
      title: "2) IVF settings",
      body: "Tune nlist (number of clusters) and nprobe (how many to search).",
      anchor: '[data-tour="ivf"]',
    },
    {
      id: "pq",
      title: "3) PQ settings",
      body: "Adjust subquantizers (m) and codebook size (ks) to control compression.",
      anchor: '[data-tour="pq"]',
    },
    {
      id: "actions",
      title: "4) Train the index",
      body: "Click Train to build IVF + PQ for the current settings.",
      anchor: '[data-tour="actions"]',
    },
    {
      id: "query",
      title: "5) Query & Benchmark",
      body: "Run once or Benchmark Grid to see recall vs latency trade-offs.",
      anchor: '[data-tour="query"]',
    },
  ];

  return (
    <div className="container">
      <h1>NeuroSearchLabs</h1>
      <div className="small">{status}</div>

      {/* top actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button
          className="button ghost"
          onClick={async () => {
            await reset();
            clear();
            // re-seed happens when dim changes or on reload; nudge user
            console.log("[reset] cleared storage; change a slider or reload to re-seed.");
          }}
        >
          Reset (clear storage)
        </button>
        <button className="button" onClick={() => setTourOpen(true)}>
          Guide
        </button>
      </div>

      {/* query + basic controls */}
      <div className="row" style={{ marginTop: 12 }}>
        {/* QUERY CARD */}
        <div className="card" data-tour="query">
          <div className="label">Query text</div>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., vector compression tradeoffs"
          />
          {/* ACTION BUTTONS */}
          <div className="actions" data-tour="actions" style={{ marginTop: 10 }}>
            <button className="button" onClick={() => onTrain()}>
              Train IVF + PQ
            </button>
            <button className="button secondary" onClick={() => onRun("custom")}>
              Run once
            </button>
            <button className="button" onClick={onGrid}>
              Benchmark grid
            </button>
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            3-gram toy embeddings; train again after changing settings or uploading data.
          </div>
        </div>

        {/* DIM / TOP-K controls */}
        <div className="card">
          <Controls
            label="Embedding dimension"
            value={dim}
            min={64}
            max={512}
            step={32}
            onChange={setDim}
          />
          <Controls label="Top-k" value={k} min={1} max={20} step={1} onChange={setK} />
        </div>
      </div>

      {/* IVF / PQ controls */}
      <div className="row" style={{ marginTop: 12 }}>
        {/* IVF */}
        <div className="card" data-tour="ivf">
          <Controls label="IVF lists (nlist)" value={nlist} min={2} max={64} onChange={setNlist} />
          <Controls
            label="Probed lists (nprobe)"
            value={nprobe}
            min={1}
            max={Math.max(1, nlist)}
            onChange={setNprobe}
          />
        </div>

        {/* PQ */}
        <div className="card" data-tour="pq">
          <Controls label="Subquantizers (m)" value={m} min={2} max={32} onChange={setM} />
          <Controls label="Codebook size (ks)" value={ks} min={4} max={256} step={4} onChange={setKs} />
        </div>
      </div>

      {/* Uploader + Chart */}
      <div className="row" style={{ marginTop: 12 }}>
        <div className="card" data-tour="uploader">
          <CorpusUploader dim={dim} onLoaded={onUpload} />
        </div>
        <div className="card">
          <Chart points={points} />
        </div>
      </div>

      <div style={{ marginTop: 12 }} className="card">
        <Footer />
      </div>

      {/* Guided tour (renders in a portal; see Walkthrough.tsx) */}
      <Walkthrough steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
