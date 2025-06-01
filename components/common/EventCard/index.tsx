import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Event } from '@/types'

const RecruitingStatus = ({ isRecruiting }: { isRecruiting: boolean }) => {
  return isRecruiting ? (
    <Badge className="absolute right-2 top-2 font-bold">모집 중</Badge>
  ) : (
    <Badge className="absolute right-2 top-2 bg-slate-400 font-normal">모집 마감</Badge>
  )
}

const DateAndLocation = ({
  startDate,
  endDate,
  location
}: {
  startDate: string
  endDate: string
  location: string
}) => {
  const dateText = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-center text-sm text-gray-500">{dateText}</p>
      <p className="text-center text-sm text-gray-500">{location}</p>
    </div>
  )
}

export interface EventCardProps {
  event: Event
  imageSize?: number
  showStatus?: boolean
  imageWrapperClassName?: string
}

export default function EventCard({ event, imageSize, showStatus, imageWrapperClassName }: EventCardProps) {
  // Set default for parameters
  imageSize = imageSize ?? 144
  showStatus = showStatus ?? true
  imageWrapperClassName = imageWrapperClassName ?? 'mb-8 mt-4 h-24 w-24 overflow-hidden sm:h-36 sm:w-36'

  const badges = event.tags.length > 0 ? [event.semester, event.tags[0]] : [event.semester]

  return (
    <Card className="relative flex w-44 transform cursor-pointer flex-col items-center justify-center overflow-hidden px-2 py-4 shadow-md transition-transform hover:scale-105 hover:shadow-2xl sm:w-60 sm:px-4 sm:py-8">
      {showStatus && <RecruitingStatus isRecruiting={event.isRecruiting} />}

      <div className={imageWrapperClassName}>
        <Image
          src={event.imageSrc ?? '/empty-300x240.jpg'}
          alt={event.title}
          width={imageSize}
          height={imageSize}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      <p className="text-center text-base font-bold sm:text-lg">{event.title}</p>

      <DateAndLocation startDate={event.startDate} endDate={event.endDate} location={event.location} />
    </Card>
  )
}
