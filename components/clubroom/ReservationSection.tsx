'use client'

import { useState } from 'react'

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

  const handleMonthChange = (year: number, month: number) => {
    setCurrentMonth({ year, month })
  }

  return (
    <div className="mb-12 flex justify-center">
      <div className="flex max-w-5xl flex-col gap-8">
        <ReservationCalendar onMonthChange={handleMonthChange} />
        <MyReservationList currentMonth={currentMonth} />
      </div>
    </div>
  )
}
