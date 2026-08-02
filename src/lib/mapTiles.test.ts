import { describe, expect, it } from 'vitest'
import { getTileConfig } from './mapTiles'

describe('getTileConfig', () => {
  it('returns different tile URLs for light and dark themes', () => {
    const light = getTileConfig(false)
    const dark = getTileConfig(true)
    expect(light.url).not.toBe(dark.url)
    expect(light.url).toContain('light_all')
    expect(dark.url).toContain('dark_all')
  })

  it('credits both OpenStreetMap and CARTO in the attribution, for both themes', () => {
    for (const config of [getTileConfig(false), getTileConfig(true)]) {
      expect(config.attribution).toContain('OpenStreetMap')
      expect(config.attribution).toContain('CARTO')
    }
  })
})
