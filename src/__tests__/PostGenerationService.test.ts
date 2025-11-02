import { describe, it, expect } from 'vitest'
import { postGenerationService } from '../services/PostGenerationService'

describe('PostGenerationService', () => {
  it('generateFinalPost returns content and metrics in range', async () => {
    const input = 'We shipped a new feature that improves onboarding.'
    const res = await postGenerationService.generateFinalPost(input, { tone: 'professional' })
    expect(res).toBeDefined()
    expect(typeof res.content).toBe('string')
    expect(res.content.length).toBeGreaterThan(0)
    expect(res.metrics).toBeDefined()
    expect(res.metrics.engagement).toBeGreaterThanOrEqual(0)
    expect(res.metrics.engagement).toBeLessThanOrEqual(1)
    expect(res.metrics.impact).toBeGreaterThanOrEqual(0)
    expect(res.metrics.impact).toBeLessThanOrEqual(1)
    expect(res.metrics.relevance).toBeGreaterThanOrEqual(0)
    expect(res.metrics.relevance).toBeLessThanOrEqual(1)
  })
})
