const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 17

/** 24 hourly instants spanning the viewer's own local calendar day, used as
 * the shared timeline for every row of the meeting planner grid. */
export function buildViewerDayTimeline(referenceDate: Date = new Date()): Date[] {
  const startOfLocalDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0,
  )
  return Array.from(
    { length: 24 },
    (_, hour) => new Date(startOfLocalDay.getTime() + hour * 3_600_000),
  )
}

export function isBusinessHour(localHour: number): boolean {
  return localHour >= BUSINESS_START_HOUR && localHour < BUSINESS_END_HOUR
}
