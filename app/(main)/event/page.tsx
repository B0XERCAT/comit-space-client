import { Suspense } from 'react'

import LoadingSpinner from '@/components/common/LoadingSpinner'
import SectionBanner from '@/components/common/SectionBanner'
import AddEventButton from '@/components/event/AddEventButton'
import EventList from '@/components/event/EventList'

export default function Event() {
  return (
    <div className="max-x-7xl flex flex-col items-center justify-center">
      <SectionBanner title="Event" description="CoMit의 행사를 소개합니다!" />
      <div className="mb-8 w-full max-w-7xl px-4">
        <AddEventButton />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <EventList />
      </Suspense>
    </div>
  )
}
