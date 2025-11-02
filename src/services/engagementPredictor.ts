/**
 * engagementPredictor.ts
 * Lightweight engagement scoring using embeddings as features.
 * If a heavier model is later added (TFJS), replace the scoring function with model inference.
 */
import embeddings from './embeddings'

/** Return a normalized score 0..1 representing predicted engagement */
export async function scoreEngagement(text: string): Promise<number> {
  try {
    const vec = await embeddings.embed(text)
    // feature: mean absolute value and length
    let sum = 0
    for (let i=0;i<vec.length;i++) sum += Math.abs(vec[i])
    const mean = vec.length ? sum / vec.length : 0
    const lenFactor = Math.min(1, text.length / 280)
    // simple sigmoid mapping
    const raw = mean * 0.6 + lenFactor * 0.4
    const score = 1 / (1 + Math.exp(- (raw - 0.5) * 3))
    return Math.max(0, Math.min(1, score))
  } catch (e) {
    // fallback deterministic heuristic
    const lenFactor = Math.min(1, text.length / 280)
    return Math.max(0, Math.min(1, lenFactor * 0.5 + 0.25))
  }
}

export default { scoreEngagement }

/**
 * engagementPredictor should be replaced with a small TF.js model running locally.
 * For the scaffold we provide a heuristic scoring function (0.0 - 1.0).
 */
// export async function scoreEngagement(text: string){
//   if(!text) return 0
//   // crude heuristics: longer but concise posts score higher
//   const len = Math.min(1, text.length / 280)
//   const exclaims = Math.min(1, (text.match(/!/g)||[]).length / 3)
//   const score = 0.6*len + 0.2*exclaims + 0.2*Math.random()*0.2
//   await new Promise(r=>setTimeout(r, 80))
//   return Math.max(0, Math.min(1, score))
// }

