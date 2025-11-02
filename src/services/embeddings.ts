/**
 * embeddings.ts
 * Lightweight embedding wrapper with fallback.
 * Exports: loadEmbeddingsModelIfNeeded(), embed(text)
 */

// We avoid importing heavy TFJS at module load time. If available, we dynamically import when needed.
let modelLoaded = false
let hasTF = false

export async function loadEmbeddingsModelIfNeeded(){
  if (modelLoaded) return
  try{
    // try dynamic import of tfjs
    // dynamically import TFJS if available. ignore TS errors if package isn't installed.
    // @ts-ignore
    const tf = await import('@tensorflow/tfjs')
    // TODO: if you have a model in public/models/embeddings, load it here with tf.loadGraphModel
    // For now, we mark TF available but don't load a model to keep this lightweight.
    hasTF = !!tf
  }catch(e){
    hasTF = false
  }
  modelLoaded = true
}

/**
 * Return a deterministic embedding for text. Prefer model if available, otherwise fallback.
 * The returned vector is a Float32Array.
 */
export async function embed(text: string): Promise<Float32Array>{
  await loadEmbeddingsModelIfNeeded()
  // If TFJS model were loaded, we'd run real inference here. For now, use fallback.
  return fallbackEmbed(text)
}

function fallbackEmbed(text: string){
  // deterministic cheap fallback: token frequency vector (top 64 tokens alphabetically)
  const tokens = (text || '').toLowerCase().match(/\b\w{3,}\b/g) || []
  const freq: Record<string, number> = {}
  tokens.forEach(t => (freq[t] = (freq[t] || 0) + 1))
  const keys = Object.keys(freq).sort().slice(0,64)
  const vec = new Float32Array(64)
  keys.forEach((k,i) => vec[i] = freq[k])
  return vec
}

export default { loadEmbeddingsModelIfNeeded, embed }
