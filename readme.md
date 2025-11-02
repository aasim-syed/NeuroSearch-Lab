
# 🧠 WebGPU Vector Compression Lab — Frontend-Only ANN Playground

**Interactive, browser-only lab for understanding Approximate Nearest Neighbor (ANN) search (FAISS-style IVF + PQ).**  
No backend. No API keys. No GPU. No free-trial limitations. Everything runs in your browser.

> Tune and visualize vector search like FAISS — see recall vs latency trade-offs live.

---

## 🚀 Motivation

Modern RAG systems depend on **vector search quality**, yet most engineers treat ANN like a magic box:

- “Set nprobe… I think?”
- “Try m=16 maybe?”
- “Why did recall drop? No clue.”

**This project makes ANN behavior visual, interactive, and intuitive.**

✅ Learn *why* configurations work  
✅ Compare speed vs accuracy visually  
✅ Reinforce fundamentals before plugging into Pinecone/FAISS/Milvus  

This is a **hands-on learning lab** for ML infra, RAG, and search engineers.

---

## 🎯 What it Solves

| Problem | This Project |
|--------|--------------|
ANN configs feel mysterious | Lets you tune and see effects immediately  
FAISS tutorials use tiny toy data | Uses real text → embed → index  
Most demos need servers & GPUs | **100% in-browser** compute + storage  
LLM devs skip retrieval science | See recall ↔ latency trade-offs clearly  
Debug RAG without deep search knowledge | Learn search fundamentals interactively  

---

## 🛠️ Features

| Feature | Description |
|--------|------------|
✅ IVF (inverted file index) | Clusters vectors into `nlist` buckets  
✅ PQ (product quantization) | Compress vectors w/ `m` subquantizers & `ks` codewords  
✅ ADC distance | Approximate scoring like FAISS  
✅ Web Workers | Training + querying off the UI thread  
✅ IndexedDB | Local persistent vector store  
✅ 3-gram hashing embeddings | No API keys needed (can swap to BERT later)  
✅ Recharts visualization | Recall vs latency scatter plot  
✅ Guided UI tour | Beginner-friendly walk-through  
✅ Works offline | All local compute  

---

## 👀 Demo Output Example

**Comparing ANN configs**:

| Config | Recall@5 | Latency |
|-------|---------|--------|
`m=4, ks=16, nprobe=1` | ~0.60 | ~1-2 ms  
`m=8, ks=32, nprobe=2` | ~0.75 | ~2-4 ms  
`m=16, ks=32, nprobe=4` | ~0.90 | ~5-7 ms  

> You see recall climb as latency increases — classic ANN curve.

---

## 📦 Tech Stack

| Tech | Why |
|-----|----|
React + Vite | UI  
TypeScript | Safety & clarity  
Web Workers | Concurrent ANN compute  
IndexedDB | Client-side vector DB  
Recharts | Plot recall vs latency  
CSS Glass UI | Modern UX  
Web embeddings | Local text → vector  

---

## 🧬 Architecture

Browser
├─ React UI
├─ Web Workers (train/query)
├─ IndexedDB (corpus + PQ + IVF)
└─ Recharts (visual stats)
---

## 📚 Educational Value

Skills demonstrated:

- ANN systems engineering
- Vector database internals
- WebGPU-ready data pipeline
- Browser ML compute patterns
- Embedding evaluation mindset
- Performance vs accuracy reasoning

This is useful for:

✅ RAG engineers  
✅ Search infra learners  
✅ ML interview prep  
✅ Low-cost ML experimentation  

---

## 🧪 Future Upgrades

- [ ] WebGPU kernels for k-means & distance calc
- [ ] Plug in Transformers.js / ONNX embeddings
- [ ] Bring your Milvus / Pinecone vectors
- [ ] More datasets (reviews, tweets, QA data)
- [ ] HuggingFace Spaces / Vercel demo

---

## 💡 TL;DR

A local lab to **learn, tune, and visualize vector search**, without servers or credits.

> If you understand this playground, you can tune FAISS/Milvus/Qdrant/Pinecone for real production RAG.

---

## 🏁 Run Locally

```sh
npm install
npm run dev
Open in browser — that's it.
```