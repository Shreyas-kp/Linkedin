/**
 * Simple hashtag suggester placeholder. For production, use local semantic
 * embeddings + nearest-neighbor lookup against a hashtag corpus or fetch trends
 * with user permission (but this scaffold keeps everything local).
 */
export async function suggestHashtags(text:string){
  if(!text) return []
  const words = text.toLowerCase().match(/[a-z0-9]{3,}/g) || []
  const freq:{[k:string]:number} = {}
  for(const w of words){
    freq[w] = (freq[w]||0)+1
  }
  const candidates = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,5)
  await new Promise(r=>setTimeout(r,30))
  return candidates.map(w=>'#'+w)
}
