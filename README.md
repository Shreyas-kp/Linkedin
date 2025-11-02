# LinkedIn Post Optimizer — Local-first scaffold

A privacy-first, in-browser LinkedIn post optimizer and authoring assistant. The app helps you draft, enhance, preview, and export LinkedIn posts using local heuristics and pluggable on-device models (the ML pieces are currently scaffolded as stubs so you can replace them with TFJS/WASM/ONNX integrations).

Why this project
- Enables offline / private post optimization (no external APIs by default).
- Lightweight RAG-style style library and editable templates to help craft higher-quality posts.
- Designed as a scaffold for experimenting with on-device ML models (engagement prediction, hashtag suggestion, toxicity checking).

Key features
- Compose and enhance LinkedIn posts with tone presets, templates, and CTA helpers.
- Local style library stored in IndexedDB (save and reuse successful post examples).
- Heuristic engagement scoring, hashtag suggestions, and toxicity checks (pluggable replacements supported).
- Export / copy-ready post preview and basic metrics UI.

Tech stack
- Frontend: React + TypeScript
- Bundler / dev server: Vite
- Styling: Tailwind CSS + minimal fallback CSS
- Storage: IndexedDB via `idb`
- Testing: Vitest
- Tooling: ESLint, Prettier

Repository layout (high level)
- `src/` — React app source (components, services, utils, styles)
- `src/services/` — Pluggable business logic: `localGenerator`, `PostGenerationService`, `RAGService`, `vectorStore`, `hashtagSuggester`, `engagementPredictor`, `toxicityChecker`.
- `src/components/` — UI building blocks (PostEditor, PostGenerator, StyleLibrary, SettingsSidebar, MetricsPanel, etc.)
- `ml/` — Python scripts and artifacts used to produce training data and offline models (optional)
- `FILE_DESCRIPTIONS.md` / `FILE_DESCRIPTIONS.json` — auto-generated file descriptions and previews (see README docs folder)

Quick start (Windows PowerShell)

```powershell
npm.cmd install
npm.cmd run dev
# Open the printed http://localhost:5173 (Vite may pick a different port if 5173 is busy)
```

Important developer notes
- If you see PostCSS / Tailwind errors referencing `@apply dark:...` or missing classes, check `src/index.css` and `tailwind.config.js` — the project uses class-based dark mode and custom color tokens.
- The app entry point is `src/main.tsx` and it imports `src/index.css`. If your dev build appears to serve an old `styles.css`, hard-refresh the browser or clear cache; Vite serves CSS modules for HMR in dev.
- ML/service stubs:
	- `src/services/localGenerator.ts` — template-based draft generator (replace with on-device model integration).
	- `src/services/engagementPredictor.ts` and `src/services/toxicityChecker.ts` — heuristic placeholders intended to be replaced by client-side models.

## Deep learning & NLP in this project

This project is a local-first scaffold that supports adding on-device deep learning and NLP components. The repository currently includes heuristic/stub implementations so you can iterate quickly; below is a concise overview of the concepts, models and techniques you can use when replacing those stubs with real models.

- Embeddings & semantic search
  - Use sentence/document embeddings to represent text in a vector space (e.g., SBERT, miniLM, distilled transformers). Embeddings enable nearest-neighbor retrieval for RAG-style example lookup or semantic search.
  - On-device options: small Transformer encoders ported to TFJS, ONNX, or run via WASM. Quantize models (8-bit/4-bit) to reduce memory and speed up inference.

- Retrieval-Augmented Generation (RAG)
  - Store embeddings in a lightweight vector store (IndexedDB-backed) and perform approximate nearest neighbor (ANN) search or brute-force cosine similarity for small corpora.
  - Retrieve top-k examples and use them as context for local generation or heuristic blending.

- Text generation & style transfer
  - For in-browser generation, consider small, distilled encoder-decoder or decoder-only models compatible with TFJS or ONNX Runtime Web. Use prompt templates plus retrieved examples to maintain relevance and privacy.
  - Techniques: prompt engineering, few-shot examples, retrieval priming, and temperature tuning for diversity.

- Hashtag suggestion & keyword extraction
  - Lightweight approaches: TF-IDF / RAKE / YAKE token scoring or simple token-frequency heuristics (already implemented as stubs). For higher quality, use a small classification/regression model or a transformer encoder with a small FFN head to predict tag relevance.

- Engagement prediction
  - Model type: regression or classifier that predicts engagement probability or normalized score (0..1). Train on historical post metadata (likes/comments) and textual features (length, presence of CTA, sentiment, embeddings).
  - On-device deployment: small MLP on top of embeddings, or a compact transformer fine-tuned for regression.

- Toxicity & safety checks
  - Lightweight classifiers can detect problematic language (binary or scalar toxicity score). Use curated lists + a small model for nuance.
  - Evaluate models offline and ship only vetted weights; prefer rule-based fallbacks for catastrophic cases.

- Model hosting & formats
  - TFJS: good browser support, can utilize WebGL/WebGPU backends.
  - ONNX Runtime Web: supports WASM and WebGL and can run many converted models efficiently.
  - WebAssembly (WASM) or WebGPU backends can provide better performance for large models.

- Quantization & optimization
  - Quantize weights (8-bit/4-bit) and prune where possible to reduce memory footprint. Distillation produces smaller, faster models with acceptable quality trade-offs.

- Privacy & offline-first considerations
  - Keep inference on-device by default. If external API calls are optional, gate them behind an explicit opt-in toggle and document data flows.

- Training, evaluation & reproducibility
  - The `ml/` folder can hold scripts to create training corpora, train models, and export artifacts (already present as a scaffold). Track metrics, use held-out validation data, and log model-version/seed for reproducibility.

- Integration checklist (how to replace a stub safely)
  1. Choose a compact model architecture suitable for browser inference (distilled transformer, small encoder). Convert weights to TFJS or ONNX.
  2. Add an inference wrapper under `src/services/` that exposes the same typed API as the stub (so UI/components don't change).
  3. Test the model offline with a safety harness and unit tests (place tests under `src/__tests__`).
  4. Add caching (in-memory + IndexedDB) for expensive results (embeddings, predictions).
  5. Measure latency and memory; add fallbacks if device is constrained (e.g., use heuristic functions).

If you'd like, I can add an example TFJS integration for one of the services (for example, an embeddings encoder + small MLP engagement predictor) and a small end-to-end demo that runs in the browser using a converted model.

Generating file docs
- A helper script exists to generate file previews: `node scripts/generate_file_descriptions.js` (or use `npm run docs:generate`). Run with `--watch` to auto-update during development.

Testing & linting
- Run tests: `npm.cmd test`
- Run linter: `npm.cmd run lint`

Contributing
- The repo is organized as a scaffold — preferred contributions:
	1. Replace a service stub with a self-contained on-device implementation (TFJS/WASM/ONNX).
	2. Improve RAG retrieval or add an in-browser ANN vector index.
	3. Add unit tests for critical services and components.

License
- ISC (see `package.json`) — treat this scaffold permissively and keep privacy notes when publishing.

If you'd like, I can also add a short "Developer Setup" section with exact Node version recommendations and a short checklist for replacing a service stub with a TFJS model.






Below is a single, complete, production-ready prompt you can paste to an assistant (LLM / code-generation agent) to generate the entire project from scratch (the current project plus improvements). It is verbose and prescriptive so the generator has no room for ambiguous choices. It specifies exact file names, APIs, behavior, tests, and verification steps. Use it as-is.

Use-case: "Generate a privacy-first, in-browser LinkedIn post optimizer scaffold (React + TypeScript + Vite) with the same features as the repository, but improved: robust CSS, strict typing, full service contracts, unit tests, a file-descriptions generator, and reproducible dev scripts. No external network calls by default. Provide tests and scripts so the user can run and verify everything easily."

Prompt (paste this to an LLM code-generator):

---

Project generation prompt — create a complete repo
-----------------------------------------------

Goal
- Generate a complete Git repository for a privacy-first, in-browser "LinkedIn Post Optimizer" web app.
- Tech stack: TypeScript, React (v18+), Vite, Tailwind CSS, PostCSS, idb (IndexedDB wrapper), Vitest for tests.
- All code runs in the browser; no network calls allowed by default (stubs only). The repository must be runnable with a simple `npm install` + `npm run dev` and tests must pass via `npm test`.

High-level requirements (must be strictly followed)
- Create files exactly as named and with the behavior described below. Return a finished repo tree.
- Node / npm: Assume Node v18+ and npm; scripts must use cross-platform commands (no platform-only assumptions).
- TypeScript: "strict": true, no "any" types in exported APIs. Prefer explicit types and interfaces.
- Tests: Provide Vitest unit tests (happy path + 1-2 edge cases) that must pass.
- Lint/format: Provide ESLint+Prettier config files, but generation may skip running them. They must be present.
- No external API calls by default. If any network is used, it must be behind a clearly documented opt-in configuration switch and tests must not depend on external network.

Deliverables (files & minimal content)
- Top-level:
  - package.json (scripts: dev, build, preview, test, lint, docs:generate, docs:watch)
  - tsconfig.json (strict)
  - vite.config.ts (React plugin, port 5173 default)
  - tailwind.config.js (darkMode:'class', content globs include src/**/*.{ts,tsx,js,jsx})
  - postcss.config.js (tailwind + autoprefixer)
  - README.md (clear quickstart, testing, developer notes)
  - FILE_DESCRIPTIONS.md and FILE_DESCRIPTIONS.json (short file descriptions, auto-generated)
  - generate_file_descriptions.js (Node script to regenerate FILE_DESCRIPTIONS.json; supports --watch)
  - .eslintrc.cjs and .prettierrc
  - .gitignore

- src/:
  - main.tsx — React entry. Import index.css and render `<App />`. Add a tiny, opt-in debug badge to indicate which stylesheet is applied (but do not enable by default).
  - index.css — Tailwind layers and resilient fallback CSS to prevent catastrophic layout when Tailwind classes are missing. MUST include:
    - @tailwind base; @tailwind components; @tailwind utilities;
    - CSS variables for LinkedIn palette,
    - small fallback styles for `.card`, `.btn-primary`, `.btn-secondary`, `.sidebar`, `.content-area`,
    - constrain svg/icon sizes (max-width/height),
    - `.dark body` dark-mode rules (class-based).
  - styles.css — legacy fallback stylesheet (kept but NOT imported by main).
  - App.tsx — Application shell using ThemeProvider; includes SettingsSidebar, Header, PostGenerator (main), StyleLibrary.
  - ThemeContext.tsx — typed React context providing theme ('light'|'dark'|'auto'), toneStyle, customColors, fontScale, and apply to document element (class toggling and CSS variables).
  - src/components/* — the UI components (typed, props documented):
    - Button.tsx — typed props (variant: 'primary'|'secondary'), forwards className, aria attributes.
    - Card.tsx — simple wrapper.
    - Header.tsx — displays app title and a "New Post" button.
    - Layout.tsx — layout wrapper providing fixed header and content area.
    - Input.tsx — typed input wrapper.
    - TextArea.tsx — typed textarea wrapper.
    - PostGenerator.tsx — main generator with controls (tone, audience, tone intensity), uses `postGenerationService.generateFinalPost(content, opts)`; includes Generate, Copy, Share buttons.
    - EnhancedPostGenerator.tsx — an enhanced UI for templates and suggestions.
    - LinkedInPostBuilder.tsx — preview and copy/export UI.
    - StyleLibrary.tsx — indexed-db backed examples list using `vectorStore`.
    - SettingsSidebar.tsx — settings and toggles, reads/writes ThemeContext.
    - HashtagDisplay.tsx — chip-like hashtag UI.
    - MetricsPanel.tsx and MetricIndicator.tsx — typed metric displays.
  - src/services/* — typed service modules (must export clean, documented APIs and avoid any network calls):
    - localGenerator.ts
      - export: async function generateDraft(opts: { goal: string; tone?: string }): Promise<string>
      - Behavior: synchronous stub that returns a short template-based draft. Artificial delay <= 400ms.
      - No network calls.
    - PostGenerationService.ts
      - export: const postGenerationService: { generateFinalPost(content: string, opts: { tone: 'professional'|'casual'|'technical', audience?: string, toneIntensity?: number }): Promise<{ content: string; metrics: { engagement:number; impact:number; relevance:number } }> }
      - Behavior: Use `enhancedGenerator.enhancePost()`; if empty or fails, format via `postFormatting.formatLinkedInPost()` and add hashtags from suggestHashtags().
      - Must return metrics object (engagement/impact/relevance) in 0..1 range.
    - RAGService.ts
      - export: class RAGService { constructor(examples: Example[]); getSimilarExamples(query:string,k?:number): string[] }
      - Behavior: implement a TF-like token-count cosine similarity using only local examples.json and deterministic algorithms (no external libs).
    - vectorStore.ts
      - uses `idb` to persist examples. Expose openDBAndGetAll(), savePost({text}), deletePost(id), retrieveSimilar(text,n=3).
    - hashtagSuggester.ts
      - export: async function suggestHashtags(text:string): Promise<string[]>
      - Behavior: heuristic: pick top tokens (length>=3), dedupe, prefix '#', limit to 5.
    - engagementPredictor.ts
      - export: async function scoreEngagement(text:string): Promise<number>
      - Behavior: deterministic heuristic, returns number 0..1; include tests verifying expected ranges.
    - toxicityChecker.ts
      - export: async function checkToxicity(text:string): Promise<number>
      - Behavior: simple heuristic (badWords list), return 0..1.
  - src/utils/*
    - postFormatting.ts — formatLinkedInPost, validatePostLength (<=3000), addSmartHashtags.
    - enhancedGenerator.ts — deterministic enhancer with exported function enhancePost(raw:string, opts?: EnhanceOptions): string.
  - examples.json — small set (3-8) of example posts (id,text,tags).
  - src/components tests and service tests under `src/__tests__` covering:
    - PostGenerationService.generateFinalPost returns expected shape and metrics in range.
    - RAGService.getSimilarExamples returns correct similarity order for a contrived example.
    - vectorStore save/get/delete behavior (use indexeddb in-memory mock or idb mocked).
    - engagementPredictor returns expected numeric ranges for given inputs.
    - UI component test: PostGenerator copy button calls `navigator.clipboard.writeText` (mocked) and generator changes content on generate (mock services).
  - generate_file_descriptions.js — Node script that scans repository and writes FILE_DESCRIPTIONS.json of file → one-line preview. Should support `--watch`.
  - FILE_DESCRIPTIONS.md — README-like, include "TODO: expand docs for X" section.

Implementation constraints & style
- Use TypeScript `strict: true`. Avoid `any`.
- Expose clear interfaces for every service. Add JSDoc comments for exported functions and types.
- Accessibility: Buttons must use accessible labels, inputs must be labelled.
- Error handling: services must never throw unhandled errors to the UI. Use try/catch, return fallbacks, and bubble a typed error object if necessary.
- Performance: RAGService must be synchronous in-memory token-based (no heavy libs) and deterministic; vectorStore async using idb.
- Tests: Use Vitest + jsdom for UI tests, and run `npm test` to ensure green.
- No external network requests in tests.
- All code must be well formatted and pass ESLint basic rules (you can add config, not required to run linter in generator).

Exact API contracts (copy these into the generated code)
- localGenerator.ts
  - export async function generateDraft(opts: { goal: string; tone?: string }): Promise<string>
- postGenerationService
  - interface GenerateOptions { tone: 'professional' | 'casual' | 'technical'; audience?: string; toneIntensity?: number; }
  - type PostGenerationResult = { content: string; metrics: { engagement: number; impact: number; relevance: number } }
  - export const postGenerationService: { generateFinalPost(content: string, opts: GenerateOptions): Promise<PostGenerationResult> }
- RAGService
  - type Example = { id: string; text: string; tags?: string[] }
  - export class RAGService { constructor(examples: Example[]); getSimilarExamples(query: string, k?: number): string[] }
- vectorStore
  - export async function savePost({ text }: { text: string }): Promise<number> // returns id
  - export async function openDBAndGetAll(): Promise<Array<{ id: number; text: string }>>
  - export async function deletePost(id: number): Promise<void>
  - export async function retrieveSimilar(text: string, n?: number): Promise<Array<{ id: number; text: string }>>
- hashtagSuggester
  - export async function suggestHashtags(text: string): Promise<string[]>
- engagementPredictor
  - export async function scoreEngagement(text: string): Promise<number>
- toxicityChecker
  - export async function checkToxicity(text: string): Promise<number>

UI behavior & acceptance tests
- PostGenerator component:
  - initial state: empty textarea.
  - clicking Generate should call `postGenerationService.generateFinalPost` with the current content and chosen options. After it resolves, textarea updates to `result.content` and MetricsPanel displays `result.metrics` scaled to 0..100 percentages.
  - Copy button: copies textarea content to clipboard using `navigator.clipboard.writeText`. Test must mock clipboard and assert call.
  - Share button: opens LinkedIn share URL in a new tab with the encoded content (window.open call should be used; tests can mock).
- StyleLibrary:
  - adding an example saves it to `vectorStore` and it reappears in the list.
  - "Use This" inserts the example text into PostGenerator's textarea.
- Settings:
  - Theme toggles set `document.documentElement.classList.toggle('dark', true | false)`.
- RAGService:
  - Provide example with small dataset; unit test queries a text similar to ex1 and expects ex1 to be included in top-k.

Testing examples (explicit)
- Add a Vitest test for `PostGenerationService.generateFinalPost`:
  - Given content "announce: We shipped X", when called with tone 'professional', returns result.content that includes "We shipped X" (or formatted version) and metrics.engagement ∈ [0,1].
- Add a test for `enhancedGenerator.enhancePost`:
  - Given a short paragraph >12 words with no hook, ensure `ensureHook` adds a short hook.
- Add test for `vectorStore`:
  - savePost('hello'), openDBAndGetAll() returns list containing 'hello', deletePost(id) removes it.

CI & scripts
- package.json scripts:
  - "dev": "vite"
  - "build": "vite build"
  - "preview": "vite preview"
  - "test": "vitest"
  - "lint": "eslint --ext .ts,.tsx src"
  - "docs:generate": "node scripts/generate_file_descriptions.js"
  - "docs:watch": "node generate_file_descriptions.js --watch"

README & verification checklist (must be created)
- README must include:
  - Project description and privacy note (no external calls by default).
  - Quick start commands (Windows PowerShell & Unix examples).
  - How to run tests and verify results.
  - How to regenerate FILE_DESCRIPTIONS.json.
  - Developer notes: where to replace stubs with TFJS/WASM models and how to keep everything local.
- Provide a small verification checklist in README:
  1. npm install
  2. npm run docs:generate — ensures FILE_DESCRIPTIONS.json is created.
  3. npm run dev — open printed Vite URL (or http://localhost:5173).
  4. In the browser, open DevTools -> Console -> run `document.documentElement.classList.contains('dark')` to verify theme toggling works.
  5. npm test — should run vitest and pass all tests.

Edge cases & error handling (must be included in code)
- All service functions must reject or return a deterministic fallback (never crash UI). Example: `postGenerationService.generateFinalPost` must catch exceptions from `enhancedGenerator` and return a fallback formatted result.
- Validate text length before trying to generate; if length > 3000, generator should throw a clear error and UI should display a helpful message.
- Clipboard APIs may not be available — guard `navigator.clipboard` with try/catch and fallback to `document.execCommand`.

Formatting & lint files
- Provide .eslintrc.cjs with recommended React/TypeScript rules.
- Provide .prettierrc with defaults.
- Provide .gitignore including node_modules, dist, .env.

Final output & verification instruction for the code-generator
- Generate the entire file tree and file contents exactly.
- After generating, run in your own environment the following mental checks (and print a short one-line confirmation in the final assistant message):
  - package.json contains the scripts listed above.
  - tsconfig.json has "strict": true.
  - main.tsx imports index.css.
  - index.css contains the Tailwind directives and fallback CSS.
  - generate_file_descriptions.js exists and is executable.
  - Vitest tests (at least 5 tests) exist and when tests run, they pass.
- Provide a one-line final confirmation: "PROJECT GENERATED — all files present and tests provided; run `npm install` and `npm test` to validate locally."

Important: Do not create code that reaches to external APIs or requires secrets. If optional external integrations are included (for advanced features), place them behind a clearly documented opt-in (environment variable or settings) and DO NOT enable them in tests.

Example acceptance message (from the generator when done)
- "DONE — Project scaffold generated with N files. To validate: 1) npm install 2) npm run docs:generate 3) npm test (should pass) 4) npm run dev (open http://localhost:5173)."

---

Notes & rationale
- This prompt explicitly defines file names, APIs, types, tests, and dev commands to leave no room for ambiguity.
- When you paste the above to an LLM code-generator, ask it to produce the repo and to include file contents verbatim for each file.
- If you want the generator to also run the tests and report results in the same session (if it can run shell), add: "If you can run shell commands, run 'npm ci' and 'npm test' and show the test output; otherwise only generate files."

If you want, I can:
- Convert this prompt into a compact one-liner for quicker pasting, or
- Run a generation attempt locally using the repository tools I already used in this workspace (I can create missing files and tests now). Which do you prefer?
