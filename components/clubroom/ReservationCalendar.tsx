'use client'

import { DatesSetArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Reservation } from '@/types'

import { toast } from '../ui/use-toast'

interface ReservationCalendarProps {
  onMonthChange: (year: number, month: number) => void
}

export default function ReservationCalendar({ onMonthChange }: ReservationCalendarProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState({ start: '09:00', end: '10:00' })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const session = useSession()

  const loadReservations = async (year: number, month: number) => {
    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.LIST(year, month) as ApiEndpoint)
    if (!res.ok) {
      console.error('Failed to load reservations')
      return
    }
    const json: CustomResponse = await res.json()
    setReservations(json.data.filter((reservation: Reservation) => reservation.isVerified !== 'DECLINE'))
  }

  const handleDateClick = (info: { dateStr: string }) => {
    if (!session) {
      alert('예약하려면 로그인이 필요합니다.')
      return
    }
    setSelectedDate(info.dateStr)
    setIsDialogOpen(true)
  }

  const handleReservation = async () => {
    if (!session || !selectedDate) return

    const startDateTime = `${selectedDate}T${selectedTime.start}:00`
    const endDateTime = `${selectedDate}T${selectedTime.end}:00`

    const reservationData = {
      studyId: 1,
      startTime: startDateTime,
      endTime: endDateTime,
      title,
      description
    }

    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.CREATE as ApiEndpoint, {
      method: 'POST',
      body: JSON.stringify(reservationData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.data?.accessToken}`
      },
      credentials: 'include'
    })

    if (!res.ok) {
      toast({
        title: '이미 예약된 시간입니다. 다른 시간을 선택해 주세요.',
        variant: 'destructive'
      })
      return
    }

    const json: CustomResponse = await res.json()
    setReservations([...reservations, json.data])
    setIsDialogOpen(false)
    setTitle('')
    setDescription('')
    toast({
      title: '예약에 성공했습니다.',
      variant: 'default'
    })
  }

  useEffect(() => {
    const today = new Date()
    loadReservations(today.getFullYear(), today.getMonth() + 1)
  }, [])

  const events = reservations.map((reservation) => ({
    title: `${reservation.title} (${reservation.reserver.username})`,
    start: reservation.startTime,
    end: reservation.endTime,
    backgroundColor: reservation.isVerified === 'ACCEPT' ? '#22c55e' : '#f59e0b'
  }))

  const handleDatesSet = (arg: DatesSetArg) => {
    const year = arg.view.currentStart.getFullYear()
    const month = arg.view.currentStart.getMonth() + 1
    loadReservations(year, month)
    onMonthChange(year, month)
  }

  return (
    <div className="max-w-5xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        dateClick={handleDateClick}
        datesSet={handleDatesSet}
        height="auto"
        locale="ko"
        slotMinTime="09:00:00"
        slotMaxTime="23:00:00"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>동아리방 예약하기</DialogTitle>
            <DialogDescription>선택한 날짜: {selectedDate}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-6 items-center gap-4">
              <Label className="text-right">시작 시간</Label>
              <Input
                type="time"
                value={selectedTime.start}
                onChange={(e) => setSelectedTime({ ...selectedTime, start: e.target.value })}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label className="text-right">종료 시간</Label>
              <Input
                type="time"
                value={selectedTime.end}
                onChange={(e) => setSelectedTime({ ...selectedTime, end: e.target.value })}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label className="text-right">제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-5"
                placeholder="예약 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label className="text-right">설명</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-5"
                placeholder="예약 설명을 입력하세요"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleReservation}>예약하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
