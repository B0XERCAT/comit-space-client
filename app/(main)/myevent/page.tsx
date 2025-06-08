'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Event, User } from '@/types'

interface EventWithState {
  event: Event
  state: 'Accept' | 'Wait' | 'Reject'
}

export default function MyEvent() {
  const session = useSession()
  const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined')
  const [joinedEvents, setJoinedEvents] = useState<EventWithState[]>([])
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStaffStatus = async () => {
      if (!session?.data?.accessToken) return

      try {
        const staffRes = await fetchData(API_ENDPOINTS.CLIENT.STAFF_LIST as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          }
        })

        if (staffRes.ok) {
          const staffJson: CustomResponse = await staffRes.json()
          const staffList: User[] = staffJson.data
          setIsStaff(staffList.some((staff) => staff.username === session.data.username))
        }
      } catch (error) {
        console.error('Failed to fetch staff status:', error)
      }
    }

    const fetchEvents = async () => {
      if (!session?.data?.accessToken) {
        return
      }

      try {
        // Fetch all events for staff, or created events for regular users
        const eventsRes = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LIST as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          },
          credentials: 'include',
          cache: 'no-cache'
        })
        if (!eventsRes.ok) {
          throw new Error('행사 정보를 불러오는 중 오류가 발생했습니다.')
        }

        const eventsJson: CustomResponse = await eventsRes.json()
        setCreatedEvents(eventsJson.data)

        // Fetch joined events
        const joinedEventsRes = await fetchData(API_ENDPOINTS.CLIENT.PROFILE.JOINED_EVENT as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          },
          credentials: 'include',
          cache: 'no-cache'
        })
        if (!joinedEventsRes.ok) {
          throw new Error('행사 정보를 불러오는 중 오류가 발생했습니다.')
        }

        const joinedEventsJson: CustomResponse = await joinedEventsRes.json()
        setJoinedEvents(joinedEventsJson.data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaffStatus()
    fetchEvents()
  }, [session])

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
        throw new Error('행사를 목록에서 삭제에 실패했습니다.')
      }

      // Remove the event from joinedEvents
      setJoinedEvents((prev) => prev.filter((event) => event.event.id !== eventId))

      toast({
        description: '행사를 목록에서 삭제했습니다.'
      })
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast({
        variant: 'destructive',
        description: '행사를 목록에서 삭제에 실패했습니다.'
      })
    }
  }

  const EventContent = ({ event, state, type }: { event: Event; state: string | null; type: 'joined' | 'created' }) => (
    <div className="border-b-solid flex border-b border-b-[#dee2e6] px-0 py-[18px] sm:px-4">
      <div className="flex-auto">
        <div className="mb-1 flex-col items-center gap-2 sm:flex sm:flex-row">
          <h3 className="overflow-hidden whitespace-nowrap text-[16px]/[25px] font-bold text-[#212529] sm:text-[18px]">
            {event.title}
          </h3>
          {state && (
            <span
              className={`inline-block whitespace-nowrap rounded-xl px-[7.8px] py-[4.2px] text-center align-baseline text-xs font-bold leading-none sm:px-2 sm:py-1 ${
                state === 'Wait'
                  ? 'bg-yellow-100 text-yellow-800'
                  : state === 'Accept'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {state === 'Wait' ? '대기중' : state === 'Accept' ? '승인됨' : '거절됨'}
            </span>
          )}
          {type === 'joined' && state === 'Reject' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-auto">
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>행사를 목록에서 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 이 행사를 목록에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleLeaveEvent(event.id)}>확인</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="max-h-18 overflow-hidden text-ellipsis whitespace-normal text-left text-[14px] text-[#495057]">
          {event.description}
        </div>
        <div className="mt-4 flex justify-between overflow-auto text-ellipsis whitespace-nowrap text-sm font-normal text-[#868e96]">
          <div className="max-w-lg flex-auto">
            <span className="flex-shrink overflow-hidden text-ellipsis whitespace-nowrap"></span>
            <span>{event.location}</span>
            <span> · </span>
            <span>
              {event.startDate} ~ {event.endDate}
            </span>
            <span> · </span>
            <span>
              {event.startTime} ~ {event.endTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEventList = (events: Event[] | EventWithState[], type: 'joined' | 'created') => {
    if (events.length === 0) {
      return (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-500">표시할 행사가 없습니다.</p>
        </div>
      )
    }

    return (
      <div id="eventlist-container" className="mb-10">
        {events.map((eventData, index) => {
          const event = type === 'joined' ? (eventData as EventWithState).event : (eventData as Event)
          const state = type === 'joined' ? (eventData as EventWithState).state : null

          return type === 'created' || (isStaff && type === 'joined') ? (
            <Link href={`/myevent/${event.id}`} className="cursor-pointer" key={index}>
              <EventContent event={event} state={state} type={type} />
            </Link>
          ) : (
            <div key={index}>
              <EventContent event={event} state={state} type={type} />
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">로딩중...</p>
      </div>
    )
  }

  return (
    <div id="myevent-body__content" className="flex max-w-full flex-1 flex-col pb-16 sm:pt-4">
      <div className="flex border-b border-[#dee2e6]">
        <button
          onClick={() => setActiveTab('joined')}
          className={`h-[45px] px-3 text-[16px] font-bold text-[#1b1c1d] ${
            activeTab === 'joined' ? 'border-b border-[#1b1c1d]' : ''
          }`}
        >
          참여 행사
        </button>
        {isStaff && (
          <button
            onClick={() => setActiveTab('created')}
            className={`h-[45px] px-3 text-[16px] font-bold text-[#1b1c1d] ${
              activeTab === 'created' ? 'border-b border-[#1b1c1d]' : ''
            }`}
          >
            주최 행사
          </button>
        )}
      </div>
      {activeTab === 'joined' ? renderEventList(joinedEvents, 'joined') : renderEventList(createdEvents, 'created')}
    </div>
  )
}
