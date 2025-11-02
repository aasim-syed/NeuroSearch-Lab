import { useRef, useState } from "react";
import type { BenchmarkPoint, CorpusItem, IVF, PQ } from "../lib/types";

export function useBenchmark() {
  const [status, setStatus] = useState("Idle");
  const [points, setPoints] = useState<BenchmarkPoint[]>([]);

  const ivfRef = useRef<IVF>();
  const pqRef = useRef<PQ>();
  const codesRef = useRef<number[][]>();

  const train = (items: CorpusItem[], nlist: number, m: number, ks: number) =>
    new Promise<void>((resolve, reject) => {
      try {
        if (!items?.length) {
          setStatus("⚠️ No items to train on.");
          console.warn("[train] empty items");
          resolve();
          return;
        }
        console.log("[train] start", { nlist, m, ks, nItems: items.length });

        const w = new Worker(
          new URL("../workers/trainWorker.ts", import.meta.url),
          { type: "module" }
        );
        w.onmessage = (e: MessageEvent) => {
          const { ivf, pq, codes } = e.data;
          ivfRef.current = ivf;
          pqRef.current = pq;
          codesRef.current = codes;
          setStatus(`✅ Trained IVF(nlist=${nlist}) + PQ(m=${m}, ks=${ks})`);
          console.log("[train] done", { nlist, m, ks, ivf, pq, codesLen: codes?.length });
          w.terminate();
          resolve();
        };
        w.onerror = (err) => {
          console.error("[train] worker error", err);
          setStatus("❌ Train failed (see console)");
          w.terminate();
          reject(err);
        };
        w.postMessage({ items, nlist, m, ks });
      } catch (err) {
        console.error("[train] error", err);
        setStatus("❌ Train failed (see console)");
        reject(err);
      }
    });

  const run = (
    items: CorpusItem[],
    query: string,
    dim: number,
    k: number,
    nprobe: number,
    label: string
  ) =>
    new Promise<BenchmarkPoint>((resolve, reject) => {
      try {
        if (!items?.length) {
          setStatus("⚠️ No items to query.");
          console.warn("[run] empty items");
          resolve({ id: label, recall: 0, latency: 0, label });
          return;
        }
        if (!ivfRef.current || !pqRef.current || !codesRef.current) {
          setStatus("⚠️ Train first (no IVF/PQ/codes).");
          console.warn("[run] missing refs");
          resolve({ id: label, recall: 0, latency: 0, label });
          return;
        }

        console.log("[run] start", {
          nprobe,
          k,
          label,
          ivfLists: ivfRef.current.lists?.length,
          pqLen: pqRef.current.length,
          codesLen: codesRef.current.length,
        });

        const w = new Worker(
          new URL("../workers/queryWorker.ts", import.meta.url),
          { type: "module" }
        );
        w.onmessage = (e: MessageEvent) => {
          const { recall, latency } = e.data;
          const pt = {
            id: `${label}-${points.length}`,
            recall: Number(Number(recall).toFixed(3)),
            latency,
            label,
          };
          setPoints((p) => [...p, pt]);
          setStatus(`▶️ ${label} → recall@${k}=${Number(recall).toFixed(2)}, ${latency}ms`);
          console.log("[run] done", { label, recall, latency });
          w.terminate();
          resolve(pt);
        };
        w.onerror = (err) => {
          console.error("[run] worker error", err);
          setStatus("❌ Run failed (see console)");
          w.terminate();
          reject(err);
        };
        w.postMessage({
          items,
          ivf: ivfRef.current,
          pq: pqRef.current,
          codes: codesRef.current,
          query,
          dim,
          k,
          nprobe,
        });
      } catch (err) {
        console.error("[run] error", err);
        setStatus("❌ Run failed (see console)");
        reject(err);
      }
    });

  const clear = () => setPoints([]);

  return { status, points, train, run, clear };
}
