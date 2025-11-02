/**
 * generator.ts
 * TFJS/ONNX generator wrapper with tokenizer loading, greedy decoding, timeout and
 * a safe heuristic fallback (localGenerator.generateDraft).
 *
 * To use a real model: place TFJS model files under public/models/generator/
 * (model.json + shards) and a tokenizer vocab at public/models/generator/vocab.json
 */

import { generateDraft } from './localGenerator'

let modelLoaded = false
let tfModel: any = null
let vocab: string[] | null = null

/**
 * Load TFJS from CDN by injecting a script tag. Resolves to window.tf when ready.
 * Times out after `timeoutMs`.
 */
async function loadTfjsFromCdn(timeoutMs = 8000): Promise<any> {
  if (typeof window === 'undefined') throw new Error('TFJS requires a browser runtime')
  // @ts-ignore
  if ((window as any).tf) return (window as any).tf

  const url = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
  return new Promise((resolve, reject) => {
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      reject(new Error('Loading TFJS timed out'))
    }, timeoutMs)

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => {
      if (timedOut) return
      clearTimeout(timer)
      // @ts-ignore
      if ((window as any).tf) resolve((window as any).tf)
      else reject(new Error('TFJS loaded but `tf` not found on window'))
    }
    script.onerror = (e) => {
      if (timedOut) return
      clearTimeout(timer)
      reject(new Error('Failed to load TFJS script'))
    }
    document.head.appendChild(script)
  })
}

/** Load TFJS model + tokenizer vocab if available. */
export async function loadGeneratorModelIfNeeded(): Promise<void> {
  if (modelLoaded) return
  try {
    // Try to use a global `tf` (injected via CDN) or load TFJS from CDN at runtime.
    // This avoids bundlers (vite) attempting to resolve the `@tensorflow/tfjs` package
    // at build time when it's not installed.
    // Prefer existing global if present, else load CDN script.
    // @ts-ignore
    const tf = (typeof window !== 'undefined' && (window as any).tf) || await loadTfjsFromCdn()
    try {
      // attempt to load model from public/models/generator
      // @ts-ignore
      tfModel = await tf.loadGraphModel('/models/generator/model.json')
      // try to load vocab/tokenizer mapping
      try {
        const r = await fetch('/models/generator/vocab.json')
        if (r.ok) vocab = await r.json()
      } catch (e) {
        vocab = null
      }
      modelLoaded = true
    } catch (e) {
      // model not found or failed to load
      modelLoaded = false
      tfModel = null
      vocab = null
    }
  } catch (e) {
    // tfjs not installed or blocked
    modelLoaded = false
    tfModel = null
    vocab = null
  }
}

function simpleTokenize(text: string): number[] {
  if (vocab && vocab.length) {
    // whitespace tokenization with vocab lookup
    const toks = text.split(/\s+/).map(t => t.trim()).filter(Boolean)
    const ids = toks.map(t => {
      const idx = vocab!.indexOf(t)
      return idx >= 0 ? idx : 0
    })
    return ids
  }
  // fallback: char codes modulo 256
  return text.split('').map(c => c.charCodeAt(0) % 256)
}

function detokenize(ids: number[]): string {
  if (vocab && vocab.length) {
    return ids.map(i => vocab![i] || '').join(' ')
  }
  return ids.map(i => String.fromCharCode(i)).join('')
}

async function runModelGenerate(prompt: string, opts?: { maxTokens?: number, timeoutMs?: number }): Promise<string | null> {
  if (!modelLoaded || !tfModel) return null
  // greedy sampling with simple decode; replace with beam/sampling as needed
  const maxTokens = opts?.maxTokens ?? 128
  const timeoutMs = opts?.timeoutMs ?? 8000

  // tokenize prompt
  const inputIds = simpleTokenize(prompt)

  // dynamic loop: feed model and generate tokens one by one
  // Note: many TFJS models expose a `predict` or `executeAsync` that expects tensors named e.g. 'input_ids'
  // This code attempts a few common signatures and falls back if model API differs.

  const generation = (async () => {
    // Prefer global `tf` if present, else ensure TFJS is loaded from CDN.
    // @ts-ignore
    const tf = (typeof window !== 'undefined' && (window as any).tf) || await loadTfjsFromCdn()
    const generated: number[] = []
    const context = inputIds.slice()

    for (let step = 0; step < maxTokens; step++) {
      try {
        const seq = Math.max(1, context.length)
        const arr = new Int32Array(seq)
        for (let i = 0; i < seq; i++) arr[i] = context[i] || 0
        const input = tf.tensor(arr, [1, seq], 'int32')

        let out: any
        try {
          // try named input signature
          out = await (tfModel as any).executeAsync({ input_ids: input })
        } catch (e) {
          try {
            out = await (tfModel as any).predict(input)
          } catch (e2) {
            out = await (tfModel as any).executeAsync(input)
          }
        }

        let logitsTensor: any = null
        if (Array.isArray(out)) logitsTensor = out[out.length - 1]
        else logitsTensor = out

        let data: Float32Array
        if (logitsTensor.shape && logitsTensor.shape.length === 3) {
          const last = logitsTensor.shape[1] - 1
          const sl = logitsTensor.slice([0, last, 0], [1, 1, logitsTensor.shape[2]])
          const sdata = await sl.data()
          data = sdata as Float32Array
        } else {
          data = await logitsTensor.data()
        }

        // argmax
        let maxIdx = 0
        for (let i = 1; i < data.length; i++) if (data[i] > data[maxIdx]) maxIdx = i
        generated.push(maxIdx)
        context.push(maxIdx)

        // stop if eos token (try to detect '<eos>' in vocab)
        if (vocab && vocab[maxIdx] && vocab[maxIdx].toLowerCase().includes('eos')) break

        // dispose tensors
        try { input.dispose() } catch (e) { }
        if (Array.isArray(out)) out.forEach((t: any) => { try { t.dispose && t.dispose() } catch (e) { } })
        else { try { out.dispose && out.dispose() } catch (e) { } }

      } catch (e) {
        console.warn('step generation failed', e)
        break
      }
    }

    return detokenize(generated)
  })()

  const timeout = new Promise<null>(res => setTimeout(() => res(null), timeoutMs))
  return Promise.race([generation, timeout]) as Promise<string | null>
}

export async function generateWithModel(prompt: string, opts?: { maxTokens?: number, timeoutMs?: number }) {
  try {
    await loadGeneratorModelIfNeeded()
    const res = await runModelGenerate(prompt, opts)
    if (res && res.length) return res
  } catch (e) {
    // ignore and fallback
  }
  // Fallback to heuristic stub
  return generateDraft({ goal: prompt || 'Share an update', tone: 'professional' })
}

export default { generateWithModel, loadGeneratorModelIfNeeded }
