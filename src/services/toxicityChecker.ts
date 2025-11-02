/**
 * toxicityChecker is a local placeholder. Replace with on-device safety model.
 * Returns a score where 0.0 is safe and 1.0 is highly toxic.
 */
export async function checkToxicity(text: string){
  if(!text) return 0
  const badWords = ['stupid','idiot','hate','kill']
  let count = 0
  const lower = text.toLowerCase()
  for(const w of badWords) if(lower.includes(w)) count++
  await new Promise(r=>setTimeout(r, 40))
  return Math.min(1, count / 2)
}
