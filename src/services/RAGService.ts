import examplesData from '../data/examples.json';

// Simple in-memory RAG service using TF-based vectors and cosine similarity.
// This is intentionally lightweight and runs synchronously.

type Example = { id: string; text: string; tags?: string[] };

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function toTfMap(tokens: string[]) {
  const map: Record<string, number> = {};
  for (const t of tokens) map[t] = (map[t] || 0) + 1;
  return map;
}

function dot(a: Record<string, number>, b: Record<string, number>) {
  let s = 0;
  for (const k of Object.keys(a)) if (b[k]) s += a[k] * b[k];
  return s;
}

function norm(a: Record<string, number>) {
  let s = 0;
  for (const v of Object.values(a)) s += v * v;
  return Math.sqrt(s);
}

export class RAGService {
  examples: Example[] = [];
  exampleTfs: Record<string, Record<string, number>> = {};

  constructor() {
    // load examples from JSON
    this.examples = (examplesData as Example[]).slice(0, 1000);
    for (const ex of this.examples) {
      const toks = tokenize(ex.text);
      this.exampleTfs[ex.id] = toTfMap(toks);
    }
  }

  // returns top-k example texts (strings)
  public getSimilarExamples(query: string, k = 3): string[] {
    const qtoks = tokenize(query);
    const qtf = toTfMap(qtoks);
    const qnorm = norm(qtf) || 1;

    const scores: Array<{id: string, score: number}> = [];
    for (const ex of this.examples) {
      const etf = this.exampleTfs[ex.id] || {};
      const score = dot(qtf, etf) / (qnorm * (norm(etf) || 1));
      scores.push({ id: ex.id, score });
    }
    scores.sort((a,b) => b.score - a.score);
    const top = scores.slice(0, k).map(s => this.examples.find(e => e.id === s.id)!).filter(Boolean);
    return top.map(t => t.text);
  }
}

export const ragService = new RAGService();
