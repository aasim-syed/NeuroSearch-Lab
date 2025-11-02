import { openDB } from "idb"; import type { IVF, PQ, CorpusItem } from "./types";
const DB_NAME="vclab"; const DB_VER=1;
export async function getDB(){ return openDB(DB_NAME, DB_VER, { upgrade(db){ db.createObjectStore("corpus"); db.createObjectStore("pq"); db.createObjectStore("ivf"); } }); }
export async function saveCorpus(key:string, items:CorpusItem[]){ const db=await getDB(); return db.put("corpus", items, key); }
export async function loadCorpus(key:string){ const db=await getDB(); return (await db.get("corpus", key)) as CorpusItem[]|undefined; }
export async function savePQ(key:string, pq:PQ){ const db=await getDB(); return db.put("pq", pq as any, key); }
export async function loadPQ(key:string){ const db=await getDB(); return (await db.get("pq", key)) as PQ|undefined; }
export async function saveIVF(key:string, ivf:IVF){ const db=await getDB(); return db.put("ivf", ivf as any, key); }
export async function loadIVF(key:string){ const db=await getDB(); return (await db.get("ivf", key)) as IVF|undefined; }
