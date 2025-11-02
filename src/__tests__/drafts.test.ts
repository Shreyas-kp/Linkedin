import { beforeEach, describe, expect, it } from 'vitest'
import { saveDraft, openDBAndGetAll, deleteDraft, saveOrUpdateAutosave, getAutosave } from '../services/drafts'

beforeEach(() => {
  localStorage.clear()
})

describe('drafts service', () => {
  it('saves a draft and lists it', async () => {
    const id = await saveDraft('hello world')
    const all = await openDBAndGetAll()
    expect(all.length).toBe(1)
    expect(all[0].id).toBeDefined()
    expect(all[0].content).toBe('hello world')
  })

  it('deletes a draft', async () => {
    const id = await saveDraft('to delete')
    let all = await openDBAndGetAll()
    expect(all.length).toBe(1)
    await deleteDraft(id)
    all = await openDBAndGetAll()
    expect(all.length).toBe(0)
  })

  it('autosaves and returns autosave', async () => {
    const id = await saveOrUpdateAutosave('autosave content')
    const autos = await getAutosave()
    expect(autos).not.toBeNull()
    expect(autos!.content).toBe('autosave content')
  })
})
