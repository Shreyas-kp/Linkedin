# File descriptions — linkedin-post-optimizer

This file contains one-line, auto-extracted summaries for the main source and config files in this repository. Use it for onboarding and debugging.

Format: `path` — short description

---

index.html — Single-page app host; mounts the React app at <div id="root"> and loads `/src/main.tsx`.

package.json — NPM manifest with scripts (dev/build/preview/test) and dependencies (React, Vite, Tailwind, etc.).

vite.config.ts — Vite configuration; sets up React plugin and dev server port.

vitest.config.ts — Vitest configuration for JS DOM testing environment.

tsconfig.json — TypeScript compiler options and project include paths (src).

postcss.config.js — PostCSS pipeline configuration that wires Tailwind + autoprefixer.

tailwind.config.js — Tailwind theme tokens, colors, fonts and content globs for class generation.

README.md — Project overview, local-first design notes, and quick start instructions.

---

src/main.tsx — React entry point; renders `<App />` and imports `src/index.css`. (Also contains a small runtime CSS debug badge.)

src/index.css — Primary stylesheet entry (Tailwind layers + project fallbacks); contains theme tokens, layout fallbacks and icon size constraints.

src/styles.css — Legacy simple stylesheet (non-Tailwind) kept for fallback; historically used by the app.

src/App.tsx — Main app composition: ThemeProvider, SettingsSidebar, Header, PostGenerator and StyleLibrary layout used in the app shell.

src/App_new.tsx — Alternative/simpler App variant using `Layout` and `PostGenerator` (experimental or refactor copy).

src/data/examples.json — Example post texts used by the in-browser RAG style library.


src/context/ThemeContext.tsx — Provides theme/tone/font-scale/custom color state and applies `.dark` and CSS variables to the document element.

---

src/components/Button.tsx — Small variant-aware button component (primary/secondary) wrapper used across the UI.

src/components/Card.tsx — Generic card container for panels and grouped content.

src/components/Header.tsx — Top header bar with app title and small subtext; contains New Post button.

src/components/Layout.tsx — Page shell that provides a fixed header and padded main area (used by `App_new`).

src/components/Input.tsx — Reusable single-line input field with label and error display.

src/components/TextArea.tsx — Reusable textarea with label, sizing and error support.

src/components/PostEditor.tsx — Higher-level editor component that ties generation, scoring (engagement/toxicity) and hashtag suggestions into an editing UI.

src/components/PostGenerator.tsx — Main post generation UI (controls tone, audience, generator call) and shows metrics; contains Generate / Copy / Share buttons.

src/components/PostGenerator_new.tsx — More feature-rich generator variant with presets, saved preferences, Tone intensity slider and copy/export controls.

src/components/PostGenerator.tsx.bak — Backup copy of an older PostGenerator implementation (kept for reference).

src/components/EnhancedPostGenerator.tsx — Experimental generator UI that simulates enhancement flows and templates and includes metric bars and suggestions.

src/components/LinkedInPostBuilder.tsx — Post builder/preview component with templates, write/enhance modes and copy to clipboard actions.

src/components/StyleLibrary.tsx — Style library UI that uses IndexedDB (via `vectorStore`) to save and browse example posts; exposes "Use This" and delete actions.

src/components/SettingsSidebar.tsx — Settings sidebar for theme, tone, font-scale and custom colors; reads/writes `ThemeContext`.

src/components/HashtagDisplay.tsx — Small UI to render hashtags as clickable/chip elements.

src/components/MetricsPanel.tsx — Panel that shows metric gauges and quick tips; renders engagement/impact/relevance visualizations.

src/components/MetricIndicator.tsx — Small bar indicator component used to render individual metrics (label + percent progress bar).

src/components/LinkedInPostBuilder.tsx — (duplicate listing) Post builder + templates + enhancing UI and preview (included above).

---

src/services/localGenerator.ts — Lightweight local generator adapter (stub); returns a template-based draft and simulates latency.

src/services/PostGenerationService.ts — Orchestrates enhancement flow: calls RAGService, enhancedGenerator, formatting and metrics analysis; returns final content + metrics.

src/services/RAGService.ts — Simple in-memory retrieval (TF-style token counts) returning similar example texts from `examples.json`.

src/services/vectorStore.ts — IndexedDB wrapper (idb) for saving/retrieving example posts and simple retrieval placeholder.

src/services/hashtagSuggester.ts — Heuristic hashtag suggester that extracts frequent tokens and returns hashtag candidates.

src/services/engagementPredictor.ts — Heuristic engagement scoring function (0.0-1.0); placeholder for a client-side model.

src/services/toxicityChecker.ts — Simple toxicity heuristic (counts bad words); placeholder for on-device safety model.

---

src/utils/postFormatting.ts — Utilities for formatting/validating LinkedIn posts: format, enforce length, and add hashtags.

src/utils/enhancedGenerator.ts — Deterministic post enhancer with hook/structure/CTA/hashtag helpers used by the generation service.

---

ml/__init__.py — Python package init for ML helper scripts.

ml/utils.py — Python utilities for preprocessing and dataset handling used during model training.

ml/merge_and_label.py — Script to merge scraped datasets and label training data for the engagement predictor.

ml/train_model1.py — Training script that produces artifacts (model weights and vectorizer) saved under `ml/artifacts`.

ml/artifacts/model.pt — Trained model weights (PyTorch or similar) used as reference for offline training.

ml/artifacts/vectorizer.joblib — Serialized vectorizer used to extract features for the ML model.

ml/artifacts/labels.joblib — Label encoder or auxiliary artifact related to model targets.

---

dev / misc

postcss.config.js — PostCSS plugins used in the build (Tailwind compatibility + autoprefixer).

tailwind.config.js — (listed above) Tailwind tokens and custom values referenced by `index.css` and components.

served_index_css.txt, vite_page.html — Debug artifacts captured while running the dev server (optional, safe to remove later).

---

If you want, I can now:
- (A) Append a short TODO next to any file that needs documentation expanded (e.g., public API, props, important edge cases).
- (B) Insert the first line of each file into this markdown as a one-line "snippet preview" (for easier scanning).
- (C) Generate a searchable JSON manifest mapping file → description for tooling.

Tell me which follow-up you prefer and I'll apply it.