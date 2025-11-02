import type { Vector } from "./types";
export function l2(a: Vector, b: Vector): number { let s=0; for(let i=0;i<a.length;i++){ const d=a[i]-b[i]; s+=d*d;} return Math.sqrt(s);} 
export function normalize(v: Vector){ const n=Math.sqrt(v.reduce((a,b)=>a+b*b,0))||1; return v.map(x=>x/n); }
export function rng(seed=42){ return ()=>{ let t = (seed += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
