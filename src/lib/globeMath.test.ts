import { describe, expect, it } from 'vitest'
import {
  applyRotationDelta,
  dragDeltaToRotationDelta,
  isPointVisible,
  type Rotation,
} from './globeMath'

describe('isPointVisible', () => {
  it('is visible when the point sits at the exact center of the view', () => {
    // rotation [0,0,0] puts [0,0] (Null Island) dead-center.
    expect(isPointVisible([0, 0, 0], [0, 0])).toBe(true)
  })

  it('is hidden when the point is the antipode of the view center', () => {
    expect(isPointVisible([0, 0, 0], [180, 0])).toBe(false)
  })

  it('is visible exactly on the terminator (90 degrees away)', () => {
    expect(isPointVisible([0, 0, 0], [90, 0])).toBe(true)
  })

  it('follows the rotation as it changes — a point behind the current view center is hidden', () => {
    // Rotating by lambda=-90 brings longitude 90 to the center, so its
    // former antipode (longitude -90) is now the one hidden around back.
    expect(isPointVisible([-90, 0, 0], [90, 0])).toBe(true)
    expect(isPointVisible([-90, 0, 0], [-90, 0])).toBe(false)
  })

  it('ignores roll (gamma) — it never changes which points are visible', () => {
    expect(isPointVisible([0, 0, 45], [0, 0])).toBe(true)
    expect(isPointVisible([0, 0, 200], [0, 0])).toBe(true)
  })

  it('accounts for pitch (phi) as well as yaw', () => {
    // Rotation phi=90 brings the *south* pole to the view center (verified
    // directly against d3-geo's own `projection.invert([0, 0])`), so the
    // north pole is the one hidden around the back.
    expect(isPointVisible([0, 90, 0], [0, -90])).toBe(true)
    expect(isPointVisible([0, 90, 0], [0, 90])).toBe(false)
  })
})

describe('dragDeltaToRotationDelta', () => {
  it('scales the drag delta inversely with the projection scale', () => {
    const atSmallScale = dragDeltaToRotationDelta(100, 0, 100)
    const atLargeScale = dragDeltaToRotationDelta(100, 0, 200)
    expect(atSmallScale.deltaLambda).toBeGreaterThan(atLargeScale.deltaLambda)
    expect(atLargeScale.deltaLambda).toBeCloseTo(atSmallScale.deltaLambda / 2)
  })

  it('maps horizontal drag to yaw and vertical drag to inverted pitch', () => {
    const { deltaLambda, deltaPhi } = dragDeltaToRotationDelta(50, 20, 100)
    expect(deltaLambda).toBeGreaterThan(0)
    expect(deltaPhi).toBeLessThan(0)
  })

  it('returns zero deltas for a zero-length drag', () => {
    expect(dragDeltaToRotationDelta(0, 0, 100)).toEqual({ deltaLambda: 0, deltaPhi: 0 })
  })
})

describe('applyRotationDelta', () => {
  it('adds the delta to lambda and phi', () => {
    const rotation: Rotation = [10, 5, 0]
    expect(applyRotationDelta(rotation, 15, -3)).toEqual([25, 2, 0])
  })

  it('clamps phi to +90 so the globe cannot be dragged past the pole', () => {
    const rotation: Rotation = [0, 85, 0]
    expect(applyRotationDelta(rotation, 0, 20)).toEqual([0, 90, 0])
  })

  it('clamps phi to -90 in the other direction', () => {
    const rotation: Rotation = [0, -85, 0]
    expect(applyRotationDelta(rotation, 0, -20)).toEqual([0, -90, 0])
  })

  it('lets lambda wrap freely past +/-180', () => {
    const rotation: Rotation = [170, 0, 0]
    expect(applyRotationDelta(rotation, 20, 0)).toEqual([190, 0, 0])
  })

  it('leaves gamma (roll) untouched', () => {
    const rotation: Rotation = [0, 0, 42]
    expect(applyRotationDelta(rotation, 5, 5)[2]).toBe(42)
  })
})
