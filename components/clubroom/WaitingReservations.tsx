'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Reservation } from '@/types'

interface WaitingReservationsProps {
  onRefresh: () => void
}

export default function WaitingReservations({ onRefresh }: WaitingReservationsProps) {
  const [waitingReservations, setWaitingReservations] = useState<Reservation[]>([])
  const session = useSession()
  const { toast } = useToast()

  const loadWaitingReservations = async () => {
    if (!session?.data?.accessToken) return

    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.WAITING as ApiEndpoint, {
      headers: {
        Authorization: `Bearer ${session.data.accessToken}`
      }
    })

    if (!res.ok) {
      toast({
        title: '대기 중인 예약 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
      return
    }

    const json: CustomResponse = await res.json()
    setWaitingReservations(json.data)
  }

  const handleApproval = async (reservationId: number) => {
    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.ACCEPT(reservationId) as ApiEndpoint, {
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
    loadWaitingReservations()
    onRefresh()
  }

  const handleRejection = async (reservationId: number) => {
    const res = await fetchData(API_ENDPOINTS.CLIENT.RESERVATION.REJECT(reservationId) as ApiEndpoint, {
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
    loadWaitingReservations()
    onRefresh()
  }

  useEffect(() => {
    loadWaitingReservations()
  }, [session])

  if (waitingReservations.length === 0) {
    return null
  }

  return (
    <div className="mb-8 mt-16">
      <h2 className="my-4 text-xl font-semibold">승인 대기 중인 예약</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {waitingReservations.map((reservation) => (
          <Card key={reservation.id} className="flex flex-col">
            <div className="flex-1">
              <CardHeader>
                <CardTitle>{reservation.title}</CardTitle>
                <CardDescription>예약자: {reservation.reserver.username}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {new Date(reservation.startTime).toLocaleDateString()}{' '}
                    {new Date(reservation.startTime).toLocaleTimeString()} -{' '}
                    {new Date(reservation.endTime).toLocaleTimeString()}
                  </p>
                  <p className="whitespace-pre-line text-sm text-gray-500">{reservation.description}</p>
                </div>
              </CardContent>
            </div>
            <CardFooter className="flex justify-end gap-2">
              <Button
                onClick={() => handleApproval(reservation.id)}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                승인
              </Button>
              <Button onClick={() => handleRejection(reservation.id)} variant="destructive">
                거절
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
