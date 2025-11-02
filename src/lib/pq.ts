import type { Vector, PQ } from "./types"; import { l2 } from "./math"; import { kmeans } from "./kmeans";
export function trainPQ(data: Vector[], m:number, ks:number, iters=8): PQ{
  const dim=data[0].length; const subDim=Math.floor(dim/m); const books: PQ = [] as any;
  for(let i=0;i<m;i++){
    const subspace=data.map(v=>v.slice(i*subDim,(i+1)*subDim));
    const {centroids}=kmeans(subspace, ks, iters);
    books.push({ m:1, ks, subDim, codebooks: centroids });
  }
  return books;
}
export function encodePQ(v: Vector, pq: PQ): number[]{
  const codes:number[]=[]; let offset=0;
  for(let i=0;i<pq.length;i++){
    const book=pq[i]; const sub=v.slice(offset, offset+book.subDim);
    let best=0,bd=1e9;
    for(let c=0;c<book.ks;c++){
      const dist=l2(sub, book.codebooks[c]);
      if(dist<bd){ bd=dist; best=c; }
    }
    codes.push(best); offset+=book.subDim;
  }
  return codes;
}
export function adcDistance(q: Vector, codes:number[], pq:PQ): number{
  let s=0,off=0;
  for(let i=0;i<pq.length;i++){
    const book=pq[i]; const sub=q.slice(off, off+book.subDim);
    const centroid=book.codebooks[codes[i]];
    s+=l2(sub, centroid); off+=book.subDim;
  }
  return s;
}
