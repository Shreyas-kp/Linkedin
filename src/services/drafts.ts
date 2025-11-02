export type Draft = {
  id: string
  content: string
  created: number
  title?: string
  autosave?: boolean
}

const DRAFTS_KEY = 'lp_drafts_v1'

function readAll(): Draft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Draft[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (e) {
    return []
  }
}

function writeAll(drafts: Draft[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export async function saveDraft(content: string): Promise<string> {
  const drafts = readAll()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  const title = content.split('\n')[0].slice(0,80)
  const draft: Draft = { id, content, created: Date.now(), title }
  drafts.unshift(draft)
  writeAll(drafts.slice(0, 50))
  return id
}

export async function updateDraft(id: string, content: string): Promise<void> {
  const drafts = readAll()
  const i = drafts.findIndex(d => d.id === id)
  if (i === -1) return
  drafts[i].content = content
  drafts[i].created = Date.now()
  drafts[i].title = content.split('\n')[0].slice(0,80)
  writeAll(drafts)
}

export async function saveOrUpdateAutosave(content: string): Promise<string> {
  const drafts = readAll()
  const autos = drafts.find(d => d.autosave)
  if (autos) {
    autos.content = content
    autos.created = Date.now()
    autos.title = content.split('\n')[0].slice(0,80)
    writeAll(drafts)
    return autos.id
  }
  const id = `autosave-${Date.now()}`
  const draft: Draft = { id, content, created: Date.now(), title: content.split('\n')[0].slice(0,80), autosave: true }
  drafts.unshift(draft)
  writeAll(drafts.slice(0, 50))
  return id
}

export async function getAutosave(): Promise<Draft | null> {
  const drafts = readAll()
  const autos = drafts.find(d => d.autosave)
  return autos || null
}

export async function openDBAndGetAll(): Promise<Draft[]> {
  const drafts = readAll()
  return drafts.sort((a,b) => b.created - a.created)
}

export async function deleteDraft(id: string): Promise<void> {
  const drafts = readAll().filter(d => d.id !== id)
  writeAll(drafts)
}
