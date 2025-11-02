/**
 * localGenerator provides a pluggable adapter for in-browser generation.
 * Current implementation is a simple template-based stub. Replace with a
 * real on-device model integration (WASM / ONNX / TFJS / llama.cpp wasm, etc.)
 */
export async function generateDraft(opts: {goal:string, tone?:string}){
  const {goal, tone} = opts
  // simple heuristic stub
  const header = goal ? `Goal: ${goal}\n\n` : ''
  const toneNote = tone ? `Tone: ${tone}\n\n` : ''
  const body = `I'm excited to share an update about ${goal || 'a recent milestone'} — here are the key points:\n- Impact\n- Learnings\n- Next steps\n\nWould love to hear your thoughts!`
  // mimic async model delay
  await new Promise(r=>setTimeout(r, 300))
  return header + toneNote + body
}
