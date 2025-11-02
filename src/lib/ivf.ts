import type { Vector, IVF } from "./types"; import { l2 } from "./math"; import { kmeans } from "./kmeans";
export function trainIVF(data: Vector[], nlist:number, iters=8): IVF{
  const {centroids, assign}=kmeans(data, nlist, iters);
  const lists:number[][]=Array.from({length:nlist},()=>[]);
  for(let i=0;i<data.length;i++) lists[assign[i]].push(i);
  return { centroids, lists };
}
export function probeIVF(q: Vector, ivf: IVF, nprobe:number){
  const d = ivf.centroids.map((c,idx)=>({ idx, d:l2(q,c)})).sort((a,b)=>a.d-b.d);
  const pick=d.slice(0,Math.min(nprobe,d.length)).map(x=>x.idx);
  const ids:number[]=[]; for(const p of pick) ids.push(...ivf.lists[p]);
  return ids;
}
