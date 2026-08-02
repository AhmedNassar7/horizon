/** A d3-geo rotation triple: `[lambda, phi, gamma]` in degrees — yaw, pitch,
 * and roll respectively (see d3-geo's `projection.rotate()`). Kept as a
 * plain tuple (rather than an object) since it's passed straight in/out of
 * `projection.rotate()` throughout LocationGlobe. */
export type Rotation = readonly [number, number, number]

/** A `[longitude, latitude]` pair in degrees, matching d3-geo's own point
 * convention (as returned by `projection.invert()`). */
export type GeoPoint = readonly [number, number]

const DEG2RAD = Math.PI / 180

/** Converts a geographic point to a unit vector in 3D Cartesian space, for
 * the dot-product visibility test below. */
function toUnitVector([longitude, latitude]: GeoPoint): readonly [number, number, number] {
  const lambda = longitude * DEG2RAD
  const phi = latitude * DEG2RAD
  const cosPhi = Math.cos(phi)
  return [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)]
}

/**
 * Whether a geographic point currently faces the viewer on an orthographic
 * globe rotated by `rotation` — i.e. it's on the near hemisphere, not hidden
 * around the back. d3-geo doesn't expose this directly, so it's computed by
 * hand: the point currently facing the camera dead-on is the antipode of the
 * rotation's yaw/pitch (roll/`gamma` only spins the image in-plane and never
 * changes which points are visible, so it's ignored here), and a point is on
 * the near hemisphere exactly when the angle between it and that center is
 * at most 90° — equivalently, when the dot product of their unit vectors is
 * non-negative.
 */
export function isPointVisible(rotation: Rotation, point: GeoPoint): boolean {
  const center: GeoPoint = [-rotation[0], -rotation[1]]
  const a = toUnitVector(point)
  const b = toUnitVector(center)
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  return dot >= 0
}

/** Empirically-tuned so a full-width drag across the globe feels like
 * rotating it roughly a quarter turn — not a barely-perceptible nudge, and
 * not a dizzying multi-spin flick. Scaling by the projection's current
 * `scale()` keeps that feel consistent as the user zooms in/out (the same
 * screen-pixel drag should rotate a zoomed-in globe less, in degrees, than a
 * zoomed-out one). */
export const DRAG_SENSITIVITY = 75

/** Converts a pixel drag delta (as reported by d3-drag, in the SVG's own
 * user-space units) into a rotation delta in degrees, given the
 * projection's current scale. Vertical drag is inverted (dragging down
 * tilts the near pole toward the viewer) to match the natural
 * "grab and pull" feel of the sphere underneath the pointer. */
export function dragDeltaToRotationDelta(
  dx: number,
  dy: number,
  scale: number,
): { deltaLambda: number; deltaPhi: number } {
  const k = DRAG_SENSITIVITY / scale
  // `0 - dy` rather than `-dy`: for dy===0 the latter produces -0, which
  // would make a zero-length drag report a "negative zero" phi delta —
  // harmless numerically but a needless surprise for callers/tests doing
  // strict equality.
  return { deltaLambda: dx * k, deltaPhi: (0 - dy) * k }
}

/** Applies a rotation delta, clamping pitch (`phi`) to +/-90° so the globe
 * can never be dragged upside down (past the pole and back over the top) —
 * yaw (`lambda`) wraps freely since spinning past +/-180° is exactly what a
 * rotating globe should do. Roll (`gamma`) is left untouched; nothing in
 * this app ever rotates it. */
export function applyRotationDelta(
  rotation: Rotation,
  deltaLambda: number,
  deltaPhi: number,
): Rotation {
  const phi = Math.max(-90, Math.min(90, rotation[1] + deltaPhi))
  return [rotation[0] + deltaLambda, phi, rotation[2]]
}
