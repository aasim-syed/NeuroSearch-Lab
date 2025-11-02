import { useEffect, useRef, useState } from "react"; 
import { hash3gram } from "../lib/embeddings"; 
import type { CorpusItem } from "../lib/types"; 
import { saveCorpus, loadCorpus } from "../lib/storage";

export function useCorpus(dim:number){
  const [items,setItemsState]=useState<CorpusItem[]>([]);
  const keyRef=useRef("default");

  useEffect(()=>{ (async()=>{
      const saved = await loadCorpus(keyRef.current);
      if(saved) setItemsState(saved);
      else {
        const base = `vector search fast
product quantization
inverted index
webgpu distance compute
transformers wasm browser
`.trim().split("\n");
        const seed:CorpusItem[] = base.map((t,i)=>({ id:`doc_${i}`, text:t, v:hash3gram(t, dim)}));
        setItemsState(seed); await saveCorpus(keyRef.current, seed);
      }
    })(); },[dim]);

  const setItems = async (arr:CorpusItem[])=>{ setItemsState(arr); await saveCorpus(keyRef.current, arr); };
  return { items, setItems };
}
