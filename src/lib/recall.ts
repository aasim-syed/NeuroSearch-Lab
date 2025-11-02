export function recallAtK(exact:number[], approx:number[], k:number){
  const ex=new Set(exact.slice(0,k));
  let hits=0; for(const i of approx.slice(0,k)) if(ex.has(i)) hits++;
  return hits/Math.max(1,k);
}
