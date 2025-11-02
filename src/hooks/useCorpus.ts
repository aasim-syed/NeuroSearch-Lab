import { useEffect, useState } from "react";
import { hash3gram } from "../lib/embeddings";
import type { CorpusItem } from "../lib/types";
import { saveCorpus, loadCorpus, getDB } from "../lib/storage";

/**
 * Local-first corpus that RE-EMBEDS on `dim` change.
 * We keep one key "default", but vectors are recomputed whenever `dim` changes.
 */
export function useCorpus(dim: number) {
  const [items, setItems] = useState<CorpusItem[]>([]);

  // load (texts) once, then embed to current `dim`
  useEffect(() => {
    (async () => {
      const saved = await loadCorpus("default");
      if (saved && saved.length) {
        // re-embed to current dim
        const rebaked: CorpusItem[] = saved.map((it) => ({
          ...it,
          v: hash3gram(it.text, dim),
        }));
        setItems(rebaked);
        await saveCorpus("default", rebaked);
        return;
      }

      // Proper multi-line seed
      const base = `vector search fast
product quantization
inverted index
webgpu distance compute
transformers wasm browser`
        .trim()
        .split("\n");

      const seed: CorpusItem[] = base.map((t, i) => ({
        id: `doc_${i}`,
        text: t,
        v: hash3gram(t, dim),
      }));
      setItems(seed);
      await saveCorpus("default", seed);
    })();
  }, [dim]);

  // replace all items (upload path); embed for current `dim`
  const replace = async (rows: { id?: string; text: string }[]) => {
    const next: CorpusItem[] = rows.map((r, i) => ({
      id: r.id ?? `doc_${i}`,
      text: r.text,
      v: hash3gram(r.text, dim),
    }));
    setItems(next);
    await saveCorpus("default", next);
  };

  // hard reset storage (used by a Reset button)
  const reset = async () => {
    const db = await getDB();
    await db.clear("corpus");
    await db.clear("pq");
    await db.clear("ivf");
    setItems([]);
  };

  return { items, setItems: replace, reset };
}
