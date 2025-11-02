import { openDB } from 'idb'

type StoredPost = { id?: number; text: string; created: number; embedding?: number[] }

const DB_NAME = 'lpoptimizer'
const STORE = 'posts'

async function db(){
  return openDB(DB_NAME, 1, {
    upgrade(db){
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

export async function savePost({text, embedding}:{text:string; embedding?: number[]}){
  const d = await db()
  const payload: StoredPost = { text, created: Date.now() }
  if (embedding) payload.embedding = embedding
  return d.add(STORE, payload)
}

export async function openDBAndGetAll(){
  const d = await db()
  return (await d.getAll(STORE)) as Array<StoredPost & { id: number }>
}

export async function deletePost(id:number){
  const d = await db()
  return d.delete(STORE, id)
}

// A simple retrieval function to return N nearest examples.
export async function retrieveSimilar(text:string, n=3){
  const all = await openDBAndGetAll()
  // If stored embeddings exist, do cosine similarity against a fallback embedding for query
  const hasEmb = all.some(a => Array.isArray(a.embedding) && a.embedding!.length > 0)
  if (!hasEmb) return all.slice(0, n)

  // compute a simple bag-of-words embedding for the query to compare if no model
  const qvec = simpleVector(text)

  const scored = all.map(p => {
    const ev = p.embedding || []
    const score = cosine(qvec, ev)
    return { post: p, score }
  })
  scored.sort((a,b) => b.score - a.score)
  return scored.slice(0, n).map(s => s.post)
}

function simpleVector(text: string){
  const tokens = (text || '').toLowerCase().match(/\b\w{3,}\b/g) || []
  const freq: Record<string, number> = {}
  tokens.forEach(t => freq[t] = (freq[t] || 0) + 1)
  // deterministic top-64 features
  const keys = Object.keys(freq).sort().slice(0,64)
  const vec = keys.map(k => freq[k] || 0)
  return vec
}

function cosine(a:number[], b:number[]){
  if (!a.length || !b.length) return 0
  const len = Math.max(a.length, b.length)
  let dot = 0, na = 0, nb = 0
  for (let i=0;i<len;i++){
    const ai = a[i] || 0
    const bi = b[i] || 0
    dot += ai*bi
    na += ai*ai
    nb += bi*bi
  }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-12)
}
