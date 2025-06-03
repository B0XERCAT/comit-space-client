'use client'

import { useCallback, useState } from 'react'

import MyReservationList from './MyReservationList'
import ReservationCalendar from './ReservationCalendar'

export interface CurrentMonth {
  year: number
  month: number
}

export default function ReservationSection() {
  const [currentMonth, setCurrentMonth] = useState<CurrentMonth>(() => {
    const today = new Date()
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1
    }
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth({ year, month })
  }

  const refreshReservations = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return (
    <div className="mb-12 flex justify-center">
      <div className="flex max-w-5xl flex-col gap-8">
        <ReservationCalendar
          onMonthChange={handleMonthChange}
          onRefresh={refreshReservations}
          key={`calendar-${refreshTrigger}`}
        />
        <MyReservationList currentMonth={currentMonth} onRefresh={refreshReservations} key={`list-${refreshTrigger}`} />
      </div>
    </div>
  )
}
