'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Event, Study } from '@/types'

interface Group {
  id: number
  title: string
  type: 'study' | 'event'
}

export default function PostPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')
  const selectedType = searchParams.get('groupType')

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch studies
        const studyRes = await fetchData(API_ENDPOINTS.CLIENT.STUDY.LIST as ApiEndpoint)
        if (!studyRes.ok) {
          throw new Error('스터디 목록을 불러오는 중 오류가 발생했습니다.')
        }
        const studyJson: CustomResponse = await studyRes.json()
        const studies: Study[] = studyJson.data
        const studyGroups: Group[] = studies.map((study) => ({
          id: study.id,
          title: study.title,
          type: 'study'
        }))

        // Fetch events
        const eventRes = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LIST as ApiEndpoint)
        if (!eventRes.ok) {
          throw new Error('이벤트 목록을 불러오는 중 오류가 발생했습니다.')
        }
        const eventJson: CustomResponse = await eventRes.json()
        const events: Event[] = eventJson.data
        const eventGroups: Group[] = events.map((event) => ({
          id: event.id,
          title: event.title,
          type: 'event'
        }))

        // Combine and set groups
        setGroups([...studyGroups, ...eventGroups])
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold">스터디</h2>
          <ul className="space-y-2">
            {groups
              .filter((group) => group.type === 'study')
              .map((study) => (
                <li key={`study-${study.id}`}>
                  <Link
                    href={`/post?id=${study.id}&groupType=study`}
                    className={`block rounded-lg p-2 hover:bg-gray-100 ${
                      selectedId === study.id.toString() && selectedType === 'study' ? 'bg-gray-200' : ''
                    }`}
                  >
                    {study.title}
                  </Link>
                </li>
              ))}
          </ul>

          <h2 className="mb-4 mt-8 text-lg font-semibold">이벤트</h2>
          <ul className="space-y-2">
            {groups
              .filter((group) => group.type === 'event')
              .map((event) => (
                <li key={`event-${event.id}`}>
                  <Link
                    href={`/post?id=${event.id}&groupType=event`}
                    className={`block rounded-lg p-2 hover:bg-gray-100 ${
                      selectedId === event.id.toString() && selectedType === 'event' ? 'bg-gray-200' : ''
                    }`}
                  >
                    {event.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8">
        {selectedId && selectedType ? (
          <h1>
            Selected: {selectedType} #{selectedId}
          </h1>
        ) : (
          <div className="text-center text-gray-500">게시판을 선택해주세요</div>
        )}
      </div>
    </div>
  )
}
