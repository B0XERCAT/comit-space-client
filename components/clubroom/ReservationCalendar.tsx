'use client'

import { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState } from 'react'

import WaitingReservations from '@/components/clubroom/WaitingReservations'
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
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Reservation, User } from '@/types'

interface ReservationCalendarProps {
  onMonthChange: (year: number, month: number) => void
  onRefresh: () => void
}

const statusColors = {
  ACCEPT: 'text-green-500',
  WAIT: 'text-orange-500',
  DECLINE: 'text-red-500'
}

const statusText = {
  ACCEPT: '승인됨',
  WAIT: '대기중',
  DECLINE: '거절됨'
}

export default function ReservationCalendar({ onMonthChange, onRefresh }: ReservationCalendarProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState({ start: '09:00', end: '10:00' })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const session = useSession()
  const { toast } = useToast()

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
      toast({
        variant: 'destructive',
        description: '예약하려면 로그인이 필요합니다.'
      })
      return
    }
    setSelectedDate(info.dateStr.split('T')[0])
    setIsDialogOpen(true)
  }

  const handleReservation = async () => {
    if (!session || !selectedDate) return

    const startDateTime = new Date(`${selectedDate}T${selectedTime.start}`)
    const endDateTime = new Date(`${selectedDate}T${selectedTime.end}`)

    startDateTime.setTime(startDateTime.getTime() + 9 * 60 * 60 * 1000)
    endDateTime.setTime(endDateTime.getTime() + 9 * 60 * 60 * 1000)

    const reservationData = {
      studyId: 1,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
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
    onRefresh()
    setIsDialogOpen(false)
    setTitle('')
    setDescription('')
    toast({
      title: '예약에 성공했습니다.',
      variant: 'default'
    })
  }

  const handleEventClick = (arg: EventClickArg) => {
    const reservationId = arg.event.id
    const reservation = reservations.find((r) => r.id === parseInt(reservationId))
    if (reservation) {
      setSelectedReservation(reservation)
      setIsDetailsDialogOpen(true)
    }
  }

  useEffect(() => {
    const today = new Date()
    loadReservations(today.getFullYear(), today.getMonth() + 1)
  }, [])

  useEffect(() => {
    const currentDate = new Date()
    loadReservations(currentDate.getFullYear(), currentDate.getMonth() + 1)
  }, [onRefresh])

  const events = reservations.map((reservation) => ({
    id: reservation.id.toString(),
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

  const checkIsStaff = async () => {
    if (!session?.data?.accessToken) return false

    const res = await fetchData(API_ENDPOINTS.CLIENT.STAFF.LIST as ApiEndpoint, {
      headers: {
        Authorization: `Bearer ${session.data.accessToken}`
      }
    })

    if (!res.ok) return false

    const json: CustomResponse = await res.json()
    const staffList: User[] = json.data
    return staffList.some((staff) => staff.username === session.data?.username)
  }

  const handleApproval = async () => {
    if (!selectedReservation) return

    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.ACCEPT(selectedReservation.id) as ApiEndpoint, {
      headers: {
        Authorization: `Bearer ${session?.data?.accessToken}`
      }
    })

    if (!res.ok) {
      toast({
        title: '승인 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: '예약이 승인되었습니다.',
      variant: 'default'
    })
    setIsDetailsDialogOpen(false)
    onRefresh()
  }

  const handleRejection = async () => {
    if (!selectedReservation) return

    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.REJECT(selectedReservation.id) as ApiEndpoint, {
      headers: {
        Authorization: `Bearer ${session?.data?.accessToken}`
      }
    })

    if (!res.ok) {
      toast({
        title: '거절 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: '예약이 거절되었습니다.',
      variant: 'default'
    })
    setIsDetailsDialogOpen(false)
    onRefresh()
  }

  useEffect(() => {
    const checkStaffStatus = async () => {
      const staffStatus = await checkIsStaff()
      setIsStaff(staffStatus)
    }

    if (session?.data?.accessToken) {
      checkStaffStatus()
    }
  }, [session])

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
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="auto"
        locale="ko"
        slotMinTime="09:00:00"
        slotMaxTime="23:00:00"
      />

      {isStaff && <WaitingReservations onRefresh={onRefresh} />}

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

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">예약 정보</DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>예약자</Label>
                <p className="text-base text-gray-600">{selectedReservation.reserver.username}</p>
              </div>
              <div className="space-y-2">
                <Label>상태</Label>
                <p className={`text-base ${statusColors[selectedReservation.isVerified]}`}>
                  {statusText[selectedReservation.isVerified]}
                </p>
              </div>
              <div className="space-y-2">
                <Label>제목</Label>
                <p className="text-base text-gray-600">{selectedReservation.title}</p>
              </div>
              <div className="space-y-2">
                <Label>시간</Label>
                <p className="text-base text-gray-600">
                  {new Date(selectedReservation.startTime).toLocaleString()} -{' '}
                  {new Date(selectedReservation.endTime).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <p className="text-base text-gray-600">{selectedReservation.description}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {isStaff && selectedReservation?.isVerified === 'WAIT' && (
              <>
                <Button onClick={handleApproval} variant="default" className="bg-green-600 hover:bg-green-700">
                  승인
                </Button>
                <Button onClick={handleRejection} variant="destructive">
                  거절
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
