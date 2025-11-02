import { openDB } from 'idb'

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

export async function savePost({text}:{text:string}){
  const d = await db()
  return d.add(STORE, {text, created: Date.now()})
}

export async function openDBAndGetAll(){
  const d = await db()
  return (await d.getAll(STORE)) as Array<{id:number,text:string}>
}

export async function deletePost(id:number){
  const d = await db()
  return d.delete(STORE, id)
}

// A simple retrieval function to return N nearest examples.
export async function retrieveSimilar(text:string, n=3){
  // Placeholder: a real implementation computes embeddings and does a vector search.
  const all = await openDBAndGetAll()
  // naive: return first n
  return all.slice(0,n)
}
