'use client'

import { useEffect, useState } from 'react'
import { IoLocationOutline } from 'react-icons/io5'
import { MdCalendarMonth } from 'react-icons/md'

import EventCard from '@/components/common/EventCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Event } from '@/types'

const formatDateRange = (startDate: string, endDate: string) => {
  if (startDate === endDate) {
    return startDate
  }
  return `${startDate} ~ ${endDate}`
}

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isJoinedMap, setIsJoinedMap] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const session = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LIST as ApiEndpoint)
        if (!res.ok) {
          throw new Error('행사 목록을 불러오는 중 오류가 발생했습니다.')
        }

        const json: CustomResponse = await res.json()
        const eventsData: Event[] = json.data ?? []
        setEvents(eventsData)

        // Check join status for each event if user is logged in
        if (session?.data?.accessToken) {
          const joinStatusMap: Record<number, boolean> = {}
          await Promise.all(
            eventsData.map(async (event) => {
              try {
                const joinRes = await fetchData(API_ENDPOINTS.CLIENT.EVENT.IS_JOINED(event.id) as ApiEndpoint, {
                  headers: {
                    Authorization: `Bearer ${session.data.accessToken}`
                  }
                })
                if (joinRes.ok) {
                  const joinJson = await joinRes.json()
                  joinStatusMap[event.id] = joinJson.data
                }
              } catch (error) {
                console.error(`Failed to check join status for event ${event.id}:`, error)
              }
            })
          )
          setIsJoinedMap(joinStatusMap)
        }
      } catch (error) {
        console.error('Failed to load events:', error)
        toast({
          variant: 'destructive',
          description: '행사 목록을 불러오는데 실패했습니다.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [session])

  const handleJoinEvent = async (eventId: number) => {
    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '행사에 참여하려면 로그인이 필요합니다.'
      })
      return
    }

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.JOIN(eventId) as ApiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('행사 참여에 실패했습니다.')
      }

      setIsJoinedMap((prev) => ({ ...prev, [eventId]: true }))
      toast({
        description: '행사 참여가 완료되었습니다.'
      })
    } catch (error) {
      console.error('Failed to join event:', error)
      toast({
        variant: 'destructive',
        description: '행사 참여에 실패했습니다.'
      })
    }
  }

  const handleLeaveEvent = async (eventId: number) => {
    if (!session?.data?.accessToken) return

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LEAVE(eventId) as ApiEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('행사 참여 취소에 실패했습니다.')
      }

      setIsJoinedMap((prev) => ({ ...prev, [eventId]: false }))
      toast({
        description: '행사 참여가 취소되었습니다.'
      })
    } catch (error) {
      console.error('Failed to leave event:', error)
      toast({
        variant: 'destructive',
        description: '행사 참여 취소에 실패했습니다.'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex justify-center">
        <p className="text-lg text-gray-500">예정된 행사가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="mb-20 grid grid-cols-2 gap-3 max-sm:px-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-14">
      {events.map((event) => (
        <Dialog key={event.id}>
          <DialogTrigger className="flex justify-center">
            <EventCard event={event} />
          </DialogTrigger>
          <DialogContent className="w-[324px] rounded-xl p-6 sm:w-[480px] sm:p-8">
            <DialogTitle className="break-words text-2xl font-bold">{event.title}</DialogTitle>
            <div className="mt-4 flex flex-col gap-2 text-gray-600">
              <div className="flex items-center gap-2">
                <MdCalendarMonth className="text-lg" />
                {formatDateRange(event.startDate, event.endDate)}
              </div>
              <div className="flex items-center gap-2">
                <IoLocationOutline className="text-lg" />
                {event.location}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <DialogDescription className="mt-4 whitespace-pre-line break-keep">{event.description}</DialogDescription>
            {event.isRecruiting && session?.data?.accessToken && (
              <div className="mt-6 flex justify-end">
                {isJoinedMap[event.id] ? (
                  <Button variant="outline" onClick={() => handleLeaveEvent(event.id)}>
                    참여 취소
                  </Button>
                ) : (
                  <Button onClick={() => handleJoinEvent(event.id)}>참여하기</Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}

export default EventList
