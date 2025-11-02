# LinkedIn Post Optimizer — Local-first scaffold

This repository is a scaffold for a privacy-first, browser-only LinkedIn post optimizer. It provides:

- Vite + React + TypeScript app shell
- Core UI components (Post editor, Style library)
- Local storage via IndexedDB (idb)
- Pluggable adapters for generation, RAG retrieval, engagement prediction, toxicity checks and hashtag suggestions
- CI workflow for tests/linting

Important notes
- All code runs locally in the browser. The generator/ML parts are currently stubs meant to be replaced with real on-device models (WASM/ONNX/TFJS or other local runtimes such as a wasm-compiled LLM engine).
- No network requests are made by default. You are responsible for adding any opt-in telemetry or external trend lookups.

Getting started

1. Install dependencies:

```powershell
npm install
```

2. Run dev server:

```powershell
npm run dev
```

3. Open http://localhost:5173

Next steps / integration points
- Replace `src/services/localGenerator.ts` with a WASM/TFJS/ONNX-based on-device generator.
- Implement embeddings and a vector index in `src/services/vectorStore.ts` or integrate a small in-browser ANN (e.g. hnswlib wasm) and store embeddings in IndexedDB.
- Train or convert a small engagement predictor and toxicity classifier to TFJS to run client-side.

License: MIT (scaffold)
