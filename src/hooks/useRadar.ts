import { useQuery } from '@tanstack/react-query'
import { fetchRadarFrames } from '@/api/radar'

/** Only fetches once the user actually turns the radar overlay on — never
 * unconditionally, since most map views won't use it. */
export function useRadarFrames(enabled: boolean) {
  return useQuery({
    queryKey: ['radar-frames'],
    queryFn: ({ signal }) => fetchRadarFrames(signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}
