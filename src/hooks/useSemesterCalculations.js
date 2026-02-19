import { useMemo } from 'react'

function useSemesterCalculations({ startDate, endDate, totalHours }) {
  const totals = useMemo(() => {
    if (!startDate || !endDate || !totalHours) return null

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    if (end <= start) return null

    const oneDayMs = 1000 * 60 * 60 * 24
    const diffDays = Math.round((end - start) / oneDayMs) + 1
    if (diffDays <= 0) return null

    const total = Number(totalHours)
    if (!Number.isFinite(total) || total <= 0) return null

    const daily = total / diffDays
    const weekly = daily * 7

    return {
      totalDays: diffDays,
      dailyAverage: daily,
      weeklyPace: weekly,
    }
  }, [startDate, endDate, totalHours])

  return totals
}


export { useSemesterCalculations }
