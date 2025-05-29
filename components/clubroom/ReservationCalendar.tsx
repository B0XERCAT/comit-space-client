'use client'

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

export default function ReservationCalendar() {
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
    setReservations(json.data)
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

    const res = await fetch(API_ENDPOINTS.CLIENT.RESERVATION.CREATE.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    })

    if (!res.ok) {
      alert('예약 생성에 실패했습니다.')
      return
    }

    const json: CustomResponse = await res.json()
    setReservations([...reservations, json.data])
    setIsDialogOpen(false)
    setTitle('')
    setDescription('')
  }

  useEffect(() => {
    const today = new Date()
    loadReservations(today.getFullYear(), today.getMonth() + 1)
  }, [])

  const events = reservations.map((reservation) => ({
    title: `${reservation.title} (${reservation.reserver.username})`,
    start: reservation.startTime,
    end: reservation.endTime,
    backgroundColor:
      reservation.isVerified === 'APPROVED' ? '#22c55e' : reservation.isVerified === 'REJECTED' ? '#ef4444' : '#f59e0b'
  }))

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
        height="auto"
        locale="ko"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>동아리방 예약하기</DialogTitle>
            <DialogDescription>선택한 날짜: {selectedDate}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">시작 시간</Label>
              <Input
                type="time"
                value={selectedTime.start}
                onChange={(e) => setSelectedTime({ ...selectedTime, start: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">종료 시간</Label>
              <Input
                type="time"
                value={selectedTime.end}
                onChange={(e) => setSelectedTime({ ...selectedTime, end: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="예약 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">설명</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
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
