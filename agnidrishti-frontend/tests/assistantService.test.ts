import { describe, expect, it } from 'vitest'
import { cleanAssistantAnswer } from '../src/services/assistantService'

describe('assistant answer metadata cleanup', () => {
  it.each([
    'Satellite Cluster (KG-D6) Gas Field (India) [Database: gem_data]',
    'FIRMS detections are matched by proximity [Document: firms_matching]',
    'The result is supported by telemetry [Source: telemetry_db] and remains readable.',
  ])('removes source metadata from knowledge answers', (answer) => {
    const cleaned = cleanAssistantAnswer(answer)

    expect(cleaned).not.toMatch(/\[(?:database|document|source):/i)
    expect(cleaned).not.toContain('gem_data')
    expect(cleaned).not.toContain('firms_matching')
    expect(cleaned).not.toContain('telemetry_db')
  })
})
