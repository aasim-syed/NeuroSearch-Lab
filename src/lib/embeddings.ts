import { normalize } from "./math"; import type { Vector } from "./types";
export function hash3gram(text: string, dim=128): Vector{ const v=new Array(dim).fill(0); const s=`__${text.toLowerCase()}__`; for(let i=0;i<s.length-2;i++){ const tri=s.slice(i,i+3); let h=2166136261; for(let j=0;j<tri.length;j++){ h=(h ^ tri.charCodeAt(j))*16777619; } const idx=Math.abs(h)%dim; v[idx]++; } return normalize(v); }
// Optional: real on-device embeddings via @xenova/transformers can be added later.
