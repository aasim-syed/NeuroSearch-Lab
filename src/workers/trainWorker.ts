// @ts-nocheck
import type { Vector, CorpusItem, IVF, PQ } from "../lib/types";
import { trainIVF } from "../lib/ivf";
import { trainPQ, encodePQ } from "../lib/pq";

self.onmessage = (e: MessageEvent)=>{
  const { items, nlist, m, ks } = e.data as { items: CorpusItem[], nlist:number, m:number, ks:number };
  const vectors: Vector[] = items.map(x=>x.v);
  const ivf: IVF = trainIVF(vectors, nlist);
  const pq: PQ = trainPQ(vectors, m, ks);
  const codes = vectors.map(v=>encodePQ(v, pq));
  (self as any).postMessage({ ivf, pq, codes });
};
