/**
 * Simple cache helpers for embeddings using localStorage.
 */
const EMB_CACHE_KEY = 'lp_embedding_cache_v1'

export async function sha1Hex(s: string){
  if (typeof crypto !== 'undefined' && (crypto as any).subtle){
    const buf = new TextEncoder().encode(s)
    const digest = await (crypto as any).subtle.digest('SHA-1', buf)
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  }
  // fallback: simple hash
  let h = 0
  for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h |= 0 }
  return h.toString(16)
}

function readStore(): Record<string, number[]>{
  try{ const raw = localStorage.getItem(EMB_CACHE_KEY); return raw ? JSON.parse(raw) : {} }catch(e){ return {} }
}

function writeStore(st: Record<string, number[]>){
  try{ localStorage.setItem(EMB_CACHE_KEY, JSON.stringify(st)) }catch(e){ /* ignore */ }
}

export function getCachedEmbedding(key: string): number[] | null{
  const st = readStore()
  return st[key] || null
}

export function setCachedEmbedding(key: string, vec: number[]){
  const st = readStore()
  st[key] = vec
  writeStore(st)
}

export default { sha1Hex, getCachedEmbedding, setCachedEmbedding }
