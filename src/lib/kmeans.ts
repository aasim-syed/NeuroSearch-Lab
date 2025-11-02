import { l2, rng } from "./math"; import type { Vector } from "./types";
export function kmeans(data: Vector[], k: number, iters=10){
  if(!data.length) return { centroids:[], assign:[]};
  const d=data[0].length;
  const R=rng(7);
  const centroids:Array<Vector>=Array.from({length:k},()=>data[Math.floor(R()*data.length)].slice());
  const assign=new Array(data.length).fill(0);
  for(let it=0;it<iters;it++){
    for(let i=0;i<data.length;i++){
      let best=0,bd=1e9;
      for(let c=0;c<k;c++){
        const dist=l2(data[i],centroids[c]);
        if(dist<bd){ bd=dist; best=c; }
      }
      assign[i]=best;
    }
    const sums=Array.from({length:k},()=>new Array(d).fill(0));
    const counts=new Array(k).fill(0);
    for(let i=0;i<data.length;i++){
      const a=assign[i]; const v=data[i]; counts[a]++;
      for(let j=0;j<d;j++) sums[a][j]+=v[j];
    }
    for(let c=0;c<k;c++){
      const cnt=counts[c]||1;
      for(let j=0;j<d;j++) centroids[c][j]=sums[c][j]/cnt;
    }
  }
  return { centroids, assign };
}
