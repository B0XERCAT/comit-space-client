import { IoLocationOutline } from 'react-icons/io5'
import { MdCalendarMonth } from 'react-icons/md'

import EventCard from '@/components/common/EventCard'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Event } from '@/types'

const formatDateRange = (startDate: string, endDate: string) => {
  if (startDate === endDate) {
    return startDate
  }
  return `${startDate} ~ ${endDate}`
}

const EventList = async () => {
  try {
    const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LIST as ApiEndpoint)
    if (!res.ok) {
      throw new Error('행사 목록을 불러오는 중 오류가 발생했습니다.')
    }

    const json: CustomResponse = await res.json()
    const events: Event[] = json.data ?? []

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
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <DialogDescription className="mt-4 whitespace-pre-line break-keep">{event.description}</DialogDescription>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    )
  } catch (error) {
    console.error('Failed to load events:', error)
    return (
      <div className="flex justify-center">
        <p className="text-lg text-red-500">행사 목록을 불러오는데 실패했습니다.</p>
      </div>
    )
  }
}

export default EventList
