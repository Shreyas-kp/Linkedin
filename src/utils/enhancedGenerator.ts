/**
 * Deterministic post enhancer to produce LinkedIn-ready posts.
 * Goals:
 *  - Ensure a strong opening hook
 *  - Structure content into Problem -> Action -> Result
 *  - Add a short CTA
 *  - Generate 2-4 relevant hashtags from keywords
 *  - Remove 'draft' markers and ensure spacing and punctuation
 */

import { formatLinkedInPost } from './postFormatting';

const MAX_LENGTH = 3000;

export type Tone = 'professional' | 'casual' | 'technical';

export interface EnhanceOptions {
  tone: Tone;
  examples?: string[];
}

function removeDraftMarkers(text: string) {
  return text.replace(/\b(draft|rough|template)\b/gi, '').trim();
}

function extractKeywords(text: string, max=6) : string[] {
  // Heuristic keyword & phrase extractor.
  // Steps:
  //  - tokenize and remove stopwords
  //  - count unigrams, bigrams, trigrams
  //  - score ngrams favoring multi-word phrases when they repeat
  const stopwords = new Set(['the','and','a','an','to','of','in','on','for','with','is','are','was','were','that','this','it','as','by','from','be','at','or','we','you','our','i','my','me']);
  const tokens = text
    .toLowerCase()
    .replace(/[\u2019']/g, "'")
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const unigrams: Record<string, number> = {};
  for (const t of tokens) {
    if (t.length <= 2) continue;
    if (stopwords.has(t)) continue;
    unigrams[t] = (unigrams[t]||0)+1;
  }

  // build n-grams (bigrams / trigrams)
  const ngramCounts: Record<string, number> = {};
  for (let i=0;i<tokens.length;i++) {
    for (let n=2;n<=3 && i+n<=tokens.length;n++) {
      const slice = tokens.slice(i,i+n);
      if (slice.some(s => stopwords.has(s) || s.length<=2)) continue;
      const phrase = slice.join(' ');
      ngramCounts[phrase] = (ngramCounts[phrase]||0)+1;
    }
  }

  // score phrases: give weight to ngrams (prefer multi-word phrases)
  const candidates: Array<{k:string,score:number}> = [];
  for (const [k,v] of Object.entries(unigrams)) candidates.push({k, score: v});
  for (const [k,v] of Object.entries(ngramCounts)) candidates.push({k, score: v * (k.split(' ').length + 0.5)});

  candidates.sort((a,b)=>b.score - a.score);
  const items = candidates.map(c=>c.k).slice(0, max);
  return items;
}

export function ensureHook(text: string, opts?: EnhanceOptions) {
  // If first line is short (<=12 words), treat it as a hook; otherwise synthesize a hook
  const paragraphs = text.trim().split(/\n+/).map(p=>p.trim()).filter(Boolean);
  const first = paragraphs[0] || '';
  const wordCount = first.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 12) return text; // already a hook

  // Synthesize a concise hook by taking the first 12 words and adding a question or strong statement
  const first12 = first.split(/\s+/).slice(0,12).join(' ');
  const tone = opts?.tone || 'professional';
  // If examples are provided, bias the hook toward example keywords for tighter context
  const exampleTexts: string[] | undefined = (opts as any)?.examples || (opts as any)?.__examples;
  let hookTail = tone === 'casual' ? '— here’s why:' : tone === 'technical' ? '— the details:' : '— why it matters:';
  if (exampleTexts && exampleTexts.length) {
    // pull a top keyword from examples to make hook feel anchored
    try {
      const exKeys = extractKeywords(exampleTexts[0], 1);
      if (exKeys && exKeys.length) {
        const kw = exKeys[0].split(' ').slice(0,3).join(' ');
        hookTail = tone === 'casual' ? `— what ${kw} taught us:` : tone === 'technical' ? `— ${kw} explained:` : `— why ${kw} matters:`;
      }
    } catch (e) {
      // ignore and use default hookTail
    }
  }
  const hook = `${first12} ${hookTail}`;
  return [hook, ...paragraphs].join('\n\n');
}

export function structurePost(text: string, opts?: EnhanceOptions) {
  // Aim: Problem -> Action -> Result. If user already has paragraphs, try to map them.
  const paragraphs = text.trim().split(/\n+/).map(p=>p.trim()).filter(Boolean);
  if (paragraphs.length >= 3) {
    // ensure order Hook (first), Problem, Action, Result
    return paragraphs.slice(0,4).join('\n\n');
  }

  // If short, attempt to split sentences into roles
  const sentences = text.split(/[.!?]\s+/).map(s=>s.trim()).filter(Boolean);
  const problem = sentences.slice(0,1).join(' ');
  const action = sentences.slice(1,2).join(' ');
  const result = sentences.slice(2,4).join(' ');

  const parts = [] as string[];
  if (problem) parts.push(problem);
  if (action) parts.push(`What I did: ${action}`);
  if (result) parts.push(`Outcome: ${result}`);
  return parts.join('\n\n');
}

export function expandKeyPoints(text: string) {
  // If user supplies short bullet points, expand them into 1-2 sentences each (heuristic)
  const lines = text.split(/\n+/);
  const bullets = lines.filter(l => /^[-*•]\s+/.test(l));
  if (bullets.length === 0) return text;
  const expanded = bullets.map(b => {
    const content = b.replace(/^[-*•]\s+/, '').trim();
    // simple expansion patterns
    return `• ${content}. This helped by focusing on ${content.split(' ').slice(0,3).join(' ')}.`;
  });
  // keep non-bullet lines at top
  const nonBullets = lines.filter(l => !/^[-*•]\s+/.test(l));
  return [...nonBullets, ...expanded].join('\n\n');
}

export function addCTA(text: string, defaultCTA?: string, opts?: EnhanceOptions) {
  // If there's already a question at end, keep it; otherwise append CTA
  const trimmed = text.trim();
  if (/[?]\s*$/.test(trimmed)) return text;
  // Avoid duplicating CTAs
  if (/\blet me know\b|\bwould love to hear\b|\bwhat do you think\b/i.test(text)) return text;
  const tone = opts?.tone || 'professional';
  let cta = defaultCTA || 'If this resonates, let me know your thoughts below.';
  if (!defaultCTA) {
    if (tone === 'casual') cta = 'Would love to hear what you think!';
    else if (tone === 'technical') cta = 'Happy to discuss technical details in the comments or messages.';
    else cta = 'If this resonates, let me know your thoughts below.';
  }
  return `${trimmed}\n\n${cta}`;
}

export function generateHashtagsFromKeywords(text: string, maxTags=4, opts?: EnhanceOptions, exampleTexts?: string[]) {
  // include keywords from examples to bias hashtag selection
  let keywords = extractKeywords(text, maxTags*3);
  if (exampleTexts && exampleTexts.length) {
    for (const ex of exampleTexts) {
      const ek = extractKeywords(ex, 3);
      for (const k of ek) if (!keywords.includes(k)) keywords.push(k);
    }
  }

  // convert phrases to CamelCase hashtags, preserve single-word tags capitalized
  const toTag = (s: string) => {
    const parts = s.split(/\s+/).map(p => p.replace(/[^a-zA-Z0-9]/g,'')).filter(Boolean);
    if (parts.length === 0) return '';
    const camel = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    return `#${camel}`;
  };

  const tags = keywords.map(k => toTag(k)).filter(Boolean);
  const uniq = Array.from(new Set(tags)).slice(0, maxTags);
  return uniq;
}

export function enforceLength(text: string) {
  if (text.length <= MAX_LENGTH) return text;
  // If too long, truncate carefully at sentence boundary near the limit
  const trunc = text.slice(0, MAX_LENGTH - 50);
  const lastPeriod = trunc.lastIndexOf('.');
  if (lastPeriod > Math.max(trunc.length - 200, 100)) {
    return trunc.slice(0, lastPeriod+1);
  }
  return trunc + '...';
}

export function enhancePost(raw: string, opts?: EnhanceOptions) {
  let text = raw;
  text = removeDraftMarkers(text);
  text = formatLinkedInPost(text);
  text = ensureHook(text, opts);
  text = expandKeyPoints(text);
  text = structurePost(text, opts);
  text = addCTA(text, undefined, opts);
  // if examples were passed via opts (not ideal to put examples in opts),
  // but PostGenerationService will now pass examples as a third param when available.
  // For backward compatibility, allow opts to contain a small `__examples` field.
  const exampleTexts: string[] | undefined = (opts as any)?.examples || (opts as any)?.__examples;
  const tags = generateHashtagsFromKeywords(text, 4, opts, exampleTexts);
  if (tags.length) {
    text = `${text}\n\n${tags.join(' ')}`;
  }
  text = enforceLength(text);
  return text.trim();
}

export default {
  enhancePost,
};
