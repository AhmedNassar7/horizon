/** Rounds a coordinate to ~1.1km precision so tiny GPS jitter on a saved
 * location doesn't produce a slightly different TanStack Query cache key
 * (and therefore an unnecessary refetch) on every visit. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100
}
