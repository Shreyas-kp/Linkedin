import React, {useState, useEffect} from 'react'
import {generateDraft} from '../services/localGenerator'
import {scoreEngagement} from '../services/engagementPredictor'
import {checkToxicity} from '../services/toxicityChecker'
import {suggestHashtags} from '../services/hashtagSuggester'

export default function PostEditor(){
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [toxicity, setToxicity] = useState<number | null>(null)
  const [hashtags, setHashtags] = useState<string[]>([])

  useEffect(()=>{
    let mounted = true
    async function analyze(){
      if(!draft) return
      const s = await scoreEngagement(draft)
      const t = await checkToxicity(draft)
      const hs = await suggestHashtags(draft)
      if(mounted){
        setScore(s)
        setToxicity(t)
        setHashtags(hs)
      }
    }
    analyze()
    return ()=>{ mounted=false }
  },[draft])

  async function onGenerate(){
    const out = await generateDraft({goal:prompt, tone: 'professional'})
    setDraft(out)
  }

  return (
    <div className="post-editor">
      <label>Goal / Prompt</label>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="E.g. announce a product launch" />
      <div className="controls">
        <button onClick={onGenerate}>Generate Draft</button>
      </div>

      <label>Draft</label>
      <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={8} />

      <div className="analysis">
        <div>Engagement score: {score===null? '—' : Math.round(score*100)}</div>
        <div>Toxicity: {toxicity===null ? '—' : toxicity.toFixed(2)}</div>
        <div>Hashtags: {hashtags.join(', ') || '—'}</div>
      </div>
    </div>
  )
}
