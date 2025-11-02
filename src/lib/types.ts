export type Vector = number[];
export type CorpusItem = { id: string; text: string; v: Vector };
export type PQ = { m: number; ks: number; subDim: number; codebooks: Vector[] }[]; // per-subspace codebook list
export type IVF = { centroids: Vector[]; lists: number[][] };
export type BenchmarkPoint = { id: string; recall: number; latency: number; label: string };
