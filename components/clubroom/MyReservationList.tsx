'use client'

import { useEffect, useState } from 'react'

import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Reservation } from '@/types'

import { toast } from '../ui/use-toast'
import { CurrentMonth } from './ReservationSection'

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

interface MyReservationListProps {
  currentMonth: CurrentMonth
}

export default function MyReservationList({ currentMonth }: MyReservationListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const session = useSession()

  useEffect(() => {
    const loadMyReservations = async () => {
      if (!session?.data?.accessToken) return

      try {
        const res = await fetchData(
          API_ENDPOINTS.CLIENT.RESERVATION.MY(currentMonth.year, currentMonth.month) as ApiEndpoint,
          {
            headers: {
              Authorization: `Bearer ${session.data.accessToken}`
            }
          }
        )

        if (!res.ok) {
          throw new Error('Failed to load reservations')
        }

        const json: CustomResponse = await res.json()
        setReservations(json.data)
      } catch (error) {
        console.error('Failed to load reservations:', error)
        toast({
          title: '예약 내역을 불러오는데 실패했습니다.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMyReservations()
  }, [session, currentMonth])

  if (isLoading) {
    return <div className="text-center">로딩중...</div>
  }

  if (reservations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">나의 예약 내역</h2>
      <div className="rounded-lg border">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="flex items-center justify-between border-b p-4 last:border-b-0">
            <div className="flex flex-col gap-1">
              <div className="font-medium">{reservation.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleString()}
              </div>
              <div className="text-sm">{reservation.description}</div>
            </div>
            <div className={`font-medium ${statusColors[reservation.isVerified]}`}>
              {statusText[reservation.isVerified]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
